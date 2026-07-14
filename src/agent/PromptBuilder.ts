import type { StadiumState } from '../store/stadiumStore';
import type { StadiumEvent } from '../simulation/EventEngine';

export class PromptBuilder {
  static readonly SYSTEM_PROMPT = `You are the FIFA 26 Operations Control Center AI Agent.
You monitor stadium state and respond to incidents.
When an incident occurs, you must assess the situation and propose an execution plan.
Your response MUST be a valid JSON object with the following structure:
{
  "planTitle": "A short, descriptive title",
  "reasoning": "Detailed explanation of why these actions are necessary",
  "rootCause": "What caused the incident",
  "estimatedImpact": "What the expected result is",
  "tool_calls": [
    { "name": "tool_name", "arguments": { "param": "value" } }
  ]
}
If the platform supports native tool calling, use that for your tool calls, but STILL return the JSON object in your message content for the reasoning, rootCause, and planTitle.
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
