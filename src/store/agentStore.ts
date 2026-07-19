import { create } from 'zustand';

export interface PlanAction {
  id: string;
  tool: string;
  params: Record<string, unknown>;
  description: string;
  status: 'pending' | 'executing' | 'done' | 'failed';
}

export interface ExecutionPlan {
  id: string;
  timestamp: number;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  reasoning: string;
  rootCause: string;
  actions: PlanAction[];
  estimatedImpact: string;
  status: 'generating' | 'pending_approval' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  triggeringEvents: string[];
}

interface AgentState {
  plans: ExecutionPlan[];
  addPlan: (plan: ExecutionPlan) => void;
  updatePlan: (planId: string, partial: Partial<ExecutionPlan>) => void;
  updatePlanStatus: (planId: string, status: ExecutionPlan['status']) => void;
  setActionStatus: (actionId: string, status: PlanAction['status']) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  plans: [],
  addPlan: (plan) => set((state) => ({ plans: [plan, ...state.plans] })),
  updatePlan: (planId, partial) => set((state) => ({
    plans: state.plans.map(p => p.id === planId ? { ...p, ...partial } : p)
  })),
  updatePlanStatus: (planId, status) => set((state) => ({
    plans: state.plans.map(p => p.id === planId ? { ...p, status } : p)
  })),
  setActionStatus: (actionId, status) => set((state) => ({
    plans: state.plans.map(p => ({
      ...p,
      actions: p.actions.map(a => a.id === actionId ? { ...a, status } : a)
    }))
  }))
}));
