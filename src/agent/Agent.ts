import { useStadiumStore } from '../store/stadiumStore';
import { useAgentStore } from '../store/agentStore';
import type { ExecutionPlan } from '../store/agentStore';
import type { StadiumEvent } from '../simulation/EventEngine';
import { PromptBuilder } from './PromptBuilder';
import { OllamaClient } from './OllamaClient';
import type { OllamaResponse } from './OllamaClient';
import { TOOL_DEFINITIONS } from './tools';
import { ToolExecutor } from './ToolExecutor';

export class Agent {
  async react(triggeringEvents: StadiumEvent[]): Promise<ExecutionPlan | null> {
    try {
      console.log('Agent React: Starting OODA loop for events:', triggeringEvents);
      // 1. OBSERVE
      const snapshot = useStadiumStore.getState();
      
      // 2. ORIENT
      const prompt = PromptBuilder.buildContext(snapshot, triggeringEvents);
      console.log('Agent React: Built prompt context.');
      
      // 3. DECIDE
      // Only give the agent action-oriented tools during incident reaction to prevent hallucinating 20 research steps
      const actionTools = TOOL_DEFINITIONS.filter(t => 
        ['open_gate', 'close_gate', 'adjust_gate_lanes', 'reroute_gate', 
         'dispatch_security', 'dispatch_medical', 'dispatch_cleaning', 
         'send_announcement', 'update_signage', 'create_maintenance_ticket', 
         'reserve_emergency_route'].includes(t.function.name)
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
        triggeringEvents: triggeringEvents.map(e => e.id)
      };
      
      store.addPlan(placeholderPlan);

      const onChunk = (partialContent: string) => {
        const partialUpdate: Partial<ExecutionPlan> = {};
        
        // Use non-greedy regex to allow matching incomplete strings that might still be generating
        const titleMatch = partialContent.match(/"planTitle"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/);
        if (titleMatch) partialUpdate.title = titleMatch[1].replace(/\\n/g, '\n');
        
        const reasoningMatch = partialContent.match(/"reasoning"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/);
        if (reasoningMatch) partialUpdate.reasoning = reasoningMatch[1].replace(/\\n/g, '\n');
        
        const rootCauseMatch = partialContent.match(/"rootCause"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/);
        if (rootCauseMatch) partialUpdate.rootCause = rootCauseMatch[1].replace(/\\n/g, '\n');
        
        const impactMatch = partialContent.match(/"estimatedImpact"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/);
        if (impactMatch) partialUpdate.estimatedImpact = impactMatch[1].replace(/\\n/g, '\n');

        if (Object.keys(partialUpdate).length > 0) {
          useAgentStore.getState().updatePlan(placeholderId, partialUpdate);
        }
      };

      console.log('Agent React: Calling Ollama...');
      let response = await OllamaClient.chat([
        { role: 'system', content: systemPromptWithTools },
        { role: 'user', content: prompt }
      ], onChunk);
      
      let retryCount = 0;
      let plan: ExecutionPlan | null = null;
      
      while (retryCount < 2 && !plan) {
        plan = this.parsePlan(response, triggeringEvents);
        
        // If parsed plan has no actions (meaning it probably hallucinated conversational text)
        if (plan.actions.length === 0) {
          console.warn(`Agent React: Retry ${retryCount + 1} - Empty actions or parse failure.`);
          response = await OllamaClient.chat([
            { role: 'system', content: systemPromptWithTools },
            { role: 'user', content: prompt },
            { role: 'assistant', content: response.content },
            { role: 'user', content: 'You failed to output a valid JSON with tool_calls. Please try again and output ONLY valid JSON without markdown wrapping.' }
          ], onChunk);
          retryCount++;
          plan = null;
        }
      }

      if (!plan) {
        throw new Error('Agent failed to generate a valid plan after retries.');
      }

      console.log('Agent React: Parsed plan:', plan);
      
      // 5. PRESENT
      plan.id = placeholderId; // keep the same ID for the UI
      useAgentStore.getState().updatePlan(placeholderId, plan);
      console.log('Agent React: Final plan updated in store.');
      
      return plan;
    } catch (e) {
      console.error('Agent failed to react:', e);
      return null;
    }
  }

  private parsePlan(response: OllamaResponse, triggeringEvents: StadiumEvent[]): ExecutionPlan {
    let parsedContent: {
      planTitle?: string;
      reasoning?: string;
      rootCause?: string;
      estimatedImpact?: string;
      tool_calls?: { name: string; arguments: Record<string, unknown> }[];
    } = {};
    
    if (response.content) {
      try {
        let jsonStr = response.content;
        const match = jsonStr.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          jsonStr = match[1];
        } else {
          const match2 = jsonStr.match(/{[\s\S]*}/);
          if (match2) {
            jsonStr = match2[0];
          }
        }
        parsedContent = JSON.parse(jsonStr);
      } catch (e) {
        console.warn('Failed to parse Agent response content as JSON:', e);
      }
    }

    const actions = [];
    
    // Check native tool calls first
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const call of response.tool_calls) {
        actions.push({
          id: crypto.randomUUID(),
          tool: call.function.name,
          params: call.function.arguments,
          description: `Execute ${call.function.name}`,
          status: 'pending' as const
        });
      }
    } else if (parsedContent.tool_calls && Array.isArray(parsedContent.tool_calls)) {
      // Fallback to JSON tool_calls
      parsedContent.tool_calls.slice(0, 3).forEach((call) => {
        actions.push({
          id: crypto.randomUUID(),
          tool: call.name,
          params: call.arguments,
          description: `Execute ${call.name}`,
          status: 'pending' as const
        });
      });
    }

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      severity: triggeringEvents[0]?.severity || 'medium',
      title: parsedContent.planTitle || 'AI Proposed Response',
      reasoning: parsedContent.reasoning || 'Based on the current situation, the following actions will mitigate the issue.',
      rootCause: parsedContent.rootCause || 'Identified from event context.',
      actions: actions,
      estimatedImpact: parsedContent.estimatedImpact || 'Expected to resolve within 15 mins.',
      status: 'pending_approval',
      triggeringEvents: triggeringEvents.map(e => e.id)
    };
  }

  async execute(plan: ExecutionPlan): Promise<void> {
    const store = useAgentStore.getState();
    
    for (const action of plan.actions) {
      store.setActionStatus(action.id, 'executing');
      try {
        await ToolExecutor.execute(action.tool, action.params);
        store.setActionStatus(action.id, 'done');
      } catch (e) {
        store.setActionStatus(action.id, 'failed');
      }
      
      // Brief pause between actions for visibility
      await new Promise(r => setTimeout(r, 600));
    }
    
    store.updatePlanStatus(plan.id, 'completed');
  }
}
