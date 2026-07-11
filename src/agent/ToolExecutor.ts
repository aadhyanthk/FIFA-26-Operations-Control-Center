import { useStadiumStore } from '../store/stadiumStore';

export class ToolExecutor {
  static async execute(toolName: string, params: Record<string, any>): Promise<string> {
    const store = useStadiumStore.getState();

    switch (toolName) {
      case 'open_gate':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: {
              ...state.gates,
              [params.gate_id]: { ...state.gates[params.gate_id], isOpen: true }
            }
          }));
          return `Gate ${params.gate_id} opened.`;
        }
        return `Gate ${params.gate_id} not found.`;
        
      case 'close_gate':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: {
              ...state.gates,
              [params.gate_id]: { ...state.gates[params.gate_id], isOpen: false }
            }
          }));
          return `Gate ${params.gate_id} closed.`;
        }
        return `Gate ${params.gate_id} not found.`;

      case 'adjust_gate_lanes':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: {
              ...state.gates,
              [params.gate_id]: { ...state.gates[params.gate_id], activeLanes: params.lanes }
            }
          }));
          return `Gate ${params.gate_id} lanes adjusted to ${params.lanes}.`;
        }
        return `Gate ${params.gate_id} not found.`;

      default:
        console.warn(`Tool ${toolName} not implemented yet`);
        return `Executed ${toolName} (mocked)`;
    }
  }
}
