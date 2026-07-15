import type { StadiumState } from '../store/stadiumStore';
import type { StadiumEvent } from '../simulation/EventEngine';

export class PromptBuilder {
  static readonly SYSTEM_PROMPT = `You are the FIFA 26 Operations Control Center AI Agent.
You monitor stadium state and respond to incidents.
When an incident occurs, you must assess the situation and propose an execution plan.

CRITICAL INSTRUCTION: Your ENTIRE response MUST be a single, valid JSON object. Do NOT wrap it in markdown block quotes (\`\`\`json). Do NOT add conversational text. Escape all double quotes inside string values.

Use this exact JSON structure:
{
  "planTitle": "Short descriptive title",
  "reasoning": "Detailed explanation",
  "rootCause": "Root cause analysis",
  "estimatedImpact": "Expected result",
  "tool_calls": [
    {
      "name": "tool_name",
      "arguments": {
        "param_name": "param_value"
      }
    }
  ]
}

Never assume capabilities you don't have. Only use the tools provided.`;

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
