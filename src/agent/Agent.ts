import { useStadiumStore } from '../store/stadiumStore';
import { useAgentStore } from '../store/agentStore';
import type { ExecutionPlan } from '../store/agentStore';
import type { StadiumEvent } from '../simulation/EventEngine';
import { PromptBuilder } from './PromptBuilder';
import { OllamaClient } from './OllamaClient';
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
      const systemPromptWithTools = `${PromptBuilder.SYSTEM_PROMPT}\n\nYou have access to the following tools. You must include any tool calls in your JSON output under the 'tool_calls' array:\n${JSON.stringify(TOOL_DEFINITIONS)}`;
      
      console.log('Agent React: Calling Ollama...');
      const response = await OllamaClient.chat([
        { role: 'system', content: systemPromptWithTools },
        { role: 'user', content: prompt }
      ]);
      console.log('Agent React: Received response from Ollama.', response);
      
      // 4. BUILD PLAN
      const plan = this.parsePlan(response, triggeringEvents);
      console.log('Agent React: Parsed plan:', plan);
      
      // 5. PRESENT
      useAgentStore.getState().addPlan(plan);
      console.log('Agent React: Plan added to store.');
      
      return plan;
    } catch (e) {
      console.error('Agent failed to react:', e);
      return null;
    }
  }

  private parsePlan(response: any, triggeringEvents: StadiumEvent[]): ExecutionPlan {
    let parsedContent: any = {};
    
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
      for (const call of parsedContent.tool_calls) {
        actions.push({
          id: crypto.randomUUID(),
          tool: call.name,
          params: call.arguments,
          description: `Execute ${call.name}`,
          status: 'pending' as const
        });
      }
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
