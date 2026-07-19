/**
 * @file Agent.ts
 * @description The core OODA (Observe–Orient–Decide–Act) reasoning loop for the
 * FIFA 26 Operations Control Center AI agent.
 *
 * The agent is triggered by unresolved {@link StadiumEvent}s. It builds a
 * situational context prompt, calls the local Ollama LLM, parses the structured
 * JSON response into an {@link ExecutionPlan}, and presents it for human approval
 * before any real-world action is taken.
 */

import { useStadiumStore } from '../store/stadiumStore';
import { useAgentStore } from '../store/agentStore';
import type { ExecutionPlan } from '../store/agentStore';
import type { StadiumEvent } from '../simulation/EventEngine';
import { PromptBuilder } from './PromptBuilder';
import { OllamaClient } from './OllamaClient';
import type { OllamaResponse } from './OllamaClient';
import { TOOL_DEFINITIONS } from './tools';
import { ToolExecutor } from './ToolExecutor';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { AGENT } = OCC_CONSTANTS;

/**
 * Shape of the structured JSON object the LLM is instructed to return.
 * Matches the PromptBuilder system prompt schema exactly.
 */
interface AgentJsonResponse {
  planTitle?: string;
  reasoning?: string;
  rootCause?: string;
  estimatedImpact?: string;
  tool_calls?: { name: string; arguments: Record<string, unknown> }[];
}

/**
 * The AI operations agent — wraps the full OODA loop from observation
 * through human-approved execution.
 *
 * One `Agent` instance is typically shared for the lifetime of the app.
 * It is stateless; all plan state is managed by `agentStore`.
 */
export class Agent {
  /**
   * Entry point for the OODA Loop. Called automatically when critical
   * incidents are detected by `EventEngine`.
   *
   * ### Phases
   * 1. **OBSERVE** — snapshot current stadium state from Zustand
   * 2. **ORIENT** — build a sanitized context string via `PromptBuilder`
   * 3. **DECIDE** — call the local Ollama LLM with action-only tools
   * 4. **ACT** — parse response into an `ExecutionPlan`; retry once on failure
   * 5. **PRESENT** — push the plan to `agentStore` for human approval
   *
   * @param triggeringEvents - The incidents that caused this analysis
   * @returns The generated `ExecutionPlan`, or `null` if generation failed
   */
  async react(triggeringEvents: StadiumEvent[]): Promise<ExecutionPlan | null> {
    try {
      // 1. OBSERVE
      const snapshot = useStadiumStore.getState();

      // 2. ORIENT
      const prompt = PromptBuilder.buildContext(snapshot, triggeringEvents);

      // 3. DECIDE — filter to action-only tools to prevent information-gathering spirals
      const actionTools = TOOL_DEFINITIONS.filter((t) =>
        [
          'open_gate', 'close_gate', 'adjust_gate_lanes', 'reroute_gate',
          'dispatch_security', 'dispatch_medical', 'dispatch_cleaning',
          'send_announcement', 'update_signage', 'create_maintenance_ticket',
          'reserve_emergency_route',
        ].includes(t.function.name)
      );

      const systemPromptWithTools = `${PromptBuilder.SYSTEM_PROMPT}\n\nYou have access to the following tools. You must include any tool calls in your JSON output under the 'tool_calls' array:\n${JSON.stringify(actionTools)}`;

      const placeholderId = crypto.randomUUID();
      const store = useAgentStore.getState();

      const placeholderPlan: ExecutionPlan = {
        id: placeholderId,
        timestamp: Date.now(),
        severity: triggeringEvents[0]?.severity || 'medium',
        title: 'Analyzing Situation...',
        reasoning: '',
        rootCause: '',
        actions: [],
        estimatedImpact: '',
        status: 'generating',
        triggeringEvents: triggeringEvents.map((e) => e.id),
      };

      store.addPlan(placeholderPlan);

      // Stream partial plan fields into the UI as they arrive
      const onChunk = (partialContent: string) => {
        const partialUpdate: Partial<ExecutionPlan> = {};

        const titleMatch = partialContent.match(
          /"planTitle"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/
        );
        if (titleMatch) partialUpdate.title = titleMatch[1].replace(/\\n/g, '\n');

        const reasoningMatch = partialContent.match(
          /"reasoning"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/
        );
        if (reasoningMatch)
          partialUpdate.reasoning = reasoningMatch[1].replace(/\\n/g, '\n');

        const rootCauseMatch = partialContent.match(
          /"rootCause"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/
        );
        if (rootCauseMatch)
          partialUpdate.rootCause = rootCauseMatch[1].replace(/\\n/g, '\n');

        const impactMatch = partialContent.match(
          /"estimatedImpact"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/
        );
        if (impactMatch)
          partialUpdate.estimatedImpact = impactMatch[1].replace(/\\n/g, '\n');

        if (Object.keys(partialUpdate).length > 0) {
          useAgentStore.getState().updatePlan(placeholderId, partialUpdate);
        }
      };

      let response = await OllamaClient.chat(
        [
          { role: 'system', content: systemPromptWithTools },
          { role: 'user', content: prompt },
        ],
        onChunk
      );

      let planRetryAttempts = 0;
      let plan: ExecutionPlan | null = null;

      // 4. ACT — parse, retry once if LLM returned conversational text without actions
      while (planRetryAttempts < AGENT.RETRY_LIMIT && !plan) {
        plan = this.parsePlan(response, triggeringEvents);

        if (plan.actions.length === 0) {
          response = await OllamaClient.chat(
            [
              { role: 'system', content: systemPromptWithTools },
              { role: 'user', content: prompt },
              { role: 'assistant', content: response.content },
              {
                role: 'user',
                content:
                  'You failed to output a valid JSON with tool_calls. Please try again and output ONLY valid JSON without markdown wrapping.',
              },
            ],
            onChunk
          );
          planRetryAttempts++;
          plan = null;
        }
      }

      if (!plan) {
        throw new Error('Agent failed to generate a valid plan after retries.');
      }

      // 5. PRESENT — attach placeholder ID so the UI card updates in place
      plan.id = placeholderId;
      useAgentStore.getState().updatePlan(placeholderId, plan);

      return plan;
    } catch (e) {
      if (e instanceof Error) {
        useAgentStore.getState().addMessage({
          id: crypto.randomUUID(),
          role: 'system',
          content: `Agent reaction failed: ${e.message}`,
          timestamp: Date.now(),
        });
      }
      return null;
    }
  }

  /**
   * Parses an Ollama response into an {@link ExecutionPlan}.
   *
   * ### Two-pass extraction strategy
   * 1. First checks for native `tool_calls` in the response object (supported
   *    by newer Ollama models with function-calling capability).
   * 2. Falls back to parsing the `content` field as a JSON string, extracting
   *    the `tool_calls` array from the structured format we instructed the LLM
   *    to use. Markdown code fences are stripped before parsing.
   *
   * @param response - Raw Ollama response (streaming has already completed)
   * @param triggeringEvents - Used to populate `severity` and `triggeringEvents` fields
   * @returns A fully formed `ExecutionPlan` (may have zero actions if parsing failed)
   */
  private parsePlan(
    response: OllamaResponse,
    triggeringEvents: StadiumEvent[]
  ): ExecutionPlan {
    let parsedContent: AgentJsonResponse = {};

    if (response.content) {
      try {
        let jsonStr = response.content;
        const fencedMatch = jsonStr.match(/```json\n([\s\S]*?)\n```/);
        if (fencedMatch) {
          jsonStr = fencedMatch[1];
        } else {
          const rawMatch = jsonStr.match(/{[\s\S]*}/);
          if (rawMatch) {
            jsonStr = rawMatch[0];
          }
        }
        parsedContent = JSON.parse(jsonStr) as AgentJsonResponse;
      } catch {
        console.warn('Failed to parse Agent response content as JSON');
      }
    }

    const actions = [];

    // Pass 1: native tool_calls (preferred)
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const call of response.tool_calls) {
        actions.push({
          id: crypto.randomUUID(),
          tool: call.function.name,
          params: call.function.arguments,
          description: `Execute ${call.function.name}`,
          status: 'pending' as const,
        });
      }
    } else if (
      parsedContent.tool_calls &&
      Array.isArray(parsedContent.tool_calls)
    ) {
      // Pass 2: JSON-embedded tool_calls (fallback for models without native support)
      parsedContent.tool_calls
        .slice(0, AGENT.MAX_TOOL_CALLS)
        .forEach((call) => {
          actions.push({
            id: crypto.randomUUID(),
            tool: call.name,
            params: call.arguments,
            description: `Execute ${call.name}`,
            status: 'pending' as const,
          });
        });
    }

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      severity: triggeringEvents[0]?.severity || 'medium',
      title: parsedContent.planTitle || 'AI Proposed Response',
      reasoning:
        parsedContent.reasoning ||
        'Based on the current situation, the following actions will mitigate the issue.',
      rootCause:
        parsedContent.rootCause || 'Identified from event context.',
      actions,
      estimatedImpact:
        parsedContent.estimatedImpact || 'Expected to resolve within 15 mins.',
      status: 'pending_approval',
      triggeringEvents: triggeringEvents.map((e) => e.id),
    };
  }

  /**
   * Executes an approved {@link ExecutionPlan} action by action.
   *
   * Each action is dispatched through {@link ToolExecutor} with a brief
   * visibility delay between actions so operators can observe progress
   * in the UI. Action statuses are updated in `agentStore` in real time.
   *
   * @param plan - The human-approved plan to execute
   */
  async execute(plan: ExecutionPlan): Promise<void> {
    const store = useAgentStore.getState();

    for (const action of plan.actions) {
      store.setActionStatus(action.id, 'executing');
      try {
        await ToolExecutor.execute(action.tool, action.params);
        store.setActionStatus(action.id, 'done');
      } catch {
        store.setActionStatus(action.id, 'failed');
      }

      await new Promise((r) => setTimeout(r, AGENT.ACTION_EXECUTION_DELAY_MS));
    }

    store.updatePlanStatus(plan.id, 'completed');
  }
}
