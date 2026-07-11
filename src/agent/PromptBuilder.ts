import type { StadiumState } from '../store/stadiumStore';
import type { StadiumEvent } from '../simulation/EventEngine';

export class PromptBuilder {
  static readonly SYSTEM_PROMPT = `You are the FIFA 26 Operations Control Center AI Agent.
You monitor stadium state and respond to incidents.
When an incident occurs, you must assess the situation and propose an execution plan.
Your response MUST be a JSON object conforming to the ExecutionPlan interface if tool-calling fails.
Never assume capabilities you don't have.`;

  static buildContext(state: StadiumState, events: StadiumEvent[]): string {
    const activeEvents = events.filter(e => e.status !== 'resolved');
    
    return `
Current Stadium State:
- Time: ${state.simTime}
- Tick: ${state.tickCount}
- Active Incidents: ${activeEvents.length}

Recent Events:
${activeEvents.map(e => `- [${e.severity.toUpperCase()}] ${e.title} at ${e.location}: ${e.description}`).join('\n')}

Based on the above, decide the next operational actions.
`;
  }
}
