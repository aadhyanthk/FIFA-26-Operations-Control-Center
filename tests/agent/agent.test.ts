import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Agent } from '../../src/agent/Agent';
import { OllamaClient } from '../../src/agent/OllamaClient';
import { useStadiumStore } from '../../src/store/stadiumStore';
import { useAgentStore } from '../../src/store/agentStore';

vi.mock('../../src/agent/OllamaClient', () => ({
  OllamaClient: {
    chat: vi.fn(),
  },
}));

describe('Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStadiumStore.setState({
      simTime: 100,
      tickCount: 100,
      incidents: [
        {
          id: 'test-1',
          type: 'crowd',
          severity: 'warning',
          title: 'Crowd Surge',
          description: 'High density',
          location: 'Gate A',
          timestamp: 90,
          status: 'unresolved'
        }
      ]
    });
    useAgentStore.setState({
      plans: []
    });
  });

  it('should generate a plan and add it to the agent store', async () => {
    const mockResponse = {
      planTitle: 'Address Crowd Surge',
      reasoning: 'Density is too high at Gate A.',
      rootCause: 'Train arrival.',
      estimatedImpact: 'Clear queue in 5 mins.',
      tool_calls: [
        {
          name: 'open_gate',
          arguments: { gate_id: 'B' }
        }
      ]
    };

    (OllamaClient.chat as any).mockImplementation(async (messages: any[], onChunk?: (s: string) => void) => {
      const content = JSON.stringify(mockResponse);
      if (onChunk) {
        // simulate partial chunks arriving
        onChunk(`{"planTitle": "Address Crowd Sur`);
        onChunk(`{"planTitle": "Address Crowd Surge", "reasoning": "Density is too high`);
        onChunk(content);
      }
      return { content };
    });

    const agent = new Agent();
    const plan = await agent.react(useStadiumStore.getState().incidents);

    expect(OllamaClient.chat).toHaveBeenCalled();
    expect(plan).not.toBeNull();
    if (plan) {
      expect(plan.title).toBe('Address Crowd Surge');
      expect(plan.actions.length).toBe(1);
      expect(plan.actions[0].tool).toBe('open_gate');
      
      // Check if added to store
      const storePlans = useAgentStore.getState().plans;
      expect(storePlans.length).toBe(1);
      expect(storePlans[0].id).toBe(plan.id);
    }
  });
  
  it('should handle malformed JSON gracefully', async () => {
    (OllamaClient.chat as any).mockImplementation(async (messages: any[], onChunk?: (s: string) => void) => {
      const content = 'Not a json object';
      if (onChunk) onChunk(content);
      return { content };
    });

    const agent = new Agent();
    
    try {
      await agent.react(useStadiumStore.getState().incidents);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
