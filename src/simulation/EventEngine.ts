export interface StadiumEvent {
  id: string;
  timestamp: number;
  type: 'crowd' | 'medical' | 'security' | 'maintenance' | 'weather' | 'transport';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  relatedEvents: string[];
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
  assignedTeam?: string;
  aiPlanId?: string;
}

export class EventEngine {
  tick(state: any): any {
    // Threshold detection implementation here
    return state;
  }
}
