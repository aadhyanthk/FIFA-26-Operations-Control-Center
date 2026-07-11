import { describe, it, expect, beforeEach } from 'vitest';
import { ToolExecutor } from '../../src/agent/ToolExecutor';
import { useStadiumStore } from '../../src/store/stadiumStore';

describe('ToolExecutor', () => {
  beforeEach(() => {
    useStadiumStore.setState({
      gates: {
        'A': { id: 'A', isOpen: false, capacityPerHour: 1000, queueLength: 0, activeLanes: 2, averageWaitTime: 0, scannerStatus: 'operational' }
      }
    });
  });

  it('should open gate via tool', async () => {
    const result = await ToolExecutor.execute('open_gate', { gate_id: 'A' });
    expect(result).toContain('Gate A opened');
    
    const store = useStadiumStore.getState();
    expect(store.gates['A'].isOpen).toBe(true);
  });

  it('should adjust gate lanes via tool', async () => {
    const result = await ToolExecutor.execute('adjust_gate_lanes', { gate_id: 'A', lanes: 4 });
    expect(result).toContain('adjusted to 4');
    
    const store = useStadiumStore.getState();
    expect(store.gates['A'].activeLanes).toBe(4);
  });
});
