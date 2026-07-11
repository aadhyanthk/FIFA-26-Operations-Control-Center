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
      // 1. OBSERVE
      const snapshot = useStadiumStore.getState();
      
      // 2. ORIENT
      const prompt = PromptBuilder.buildContext(snapshot, triggeringEvents);
      
      // 3. DECIDE
      const response = await OllamaClient.chat([
        { role: 'system', content: PromptBuilder.SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ], TOOL_DEFINITIONS);
      
      // 4. BUILD PLAN
      const plan = this.parsePlan(response, triggeringEvents);
      
      // 5. PRESENT
      useAgentStore.getState().addPlan(plan);
      
      return plan;
    } catch (e) {
      console.error('Agent failed to react:', e);
      return null;
    }
  }

  private parsePlan(response: any, triggeringEvents: StadiumEvent[]): ExecutionPlan {
    // In a real scenario, this parses tool_calls or JSON fallback from LLM
    // Mocking response parse for structural readiness
    
    return {
      id: 'plan-' + Date.now(),
      timestamp: Date.now(),
      severity: triggeringEvents[0]?.severity || 'medium',
      title: 'AI Proposed Response',
      reasoning: 'Based on the current situation, the following actions will mitigate the issue.',
      rootCause: 'Identified from event context.',
      actions: [], // populate from tool_calls
      estimatedImpact: 'Expected to resolve within 15 mins.',
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
