import { z } from 'zod';

export const schemas = {
  open_gate: z.object({
    gate_id: z.enum(['A', 'B', 'C', 'D', 'E', 'F'])
  }),
  close_gate: z.object({
    gate_id: z.enum(['A', 'B', 'C', 'D', 'E', 'F'])
  }),
  adjust_gate_lanes: z.object({
    gate_id: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
    lanes: z.number().min(1).max(10)
  }),
  dispatch_security: z.object({
    team_id: z.string(),
    location: z.string(),
    reason: z.string()
  }),
  dispatch_medical: z.object({
    team_id: z.string(),
    location: z.string(),
    incident_type: z.string()
  }),
  dispatch_cleaning: z.object({
    crew_id: z.string(),
    location: z.string(),
    priority: z.enum(['low', 'medium', 'high'])
  }),
  send_announcement: z.object({
    message: z.string(),
    zones: z.union([z.literal('all'), z.array(z.string())])
  }),
  update_signage: z.object({
    sign_ids: z.array(z.string()),
    message: z.string()
  }),
  create_maintenance_ticket: z.object({
    equipment: z.string(),
    location: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical'])
  }),
  reserve_emergency_route: z.object({
    from: z.string(),
    to: z.string()
  }),
  get_zone_density: z.object({
    zone_id: z.string()
  }),
  get_gate_status: z.object({
    gate_id: z.string().optional()
  }),
  get_team_status: z.object({
    department: z.enum(['security', 'medical', 'cleaning', 'maintenance'])
  }),
  get_active_incidents: z.object({
    severity: z.string().optional(),
    type: z.string().optional()
  }),
  query_sop: z.object({
    topic: z.string()
  }),
  reroute_gate: z.object({
    from_gate: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
    to_gate: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
    amount: z.number().positive()
  }),
  generate_situation_summary: z.object({}).catchall(z.any()),
  generate_shift_handover: z.object({}).catchall(z.any()),
  generate_incident_report: z.object({
    incident_id: z.string()
  })
};

export type ToolName = keyof typeof schemas;
