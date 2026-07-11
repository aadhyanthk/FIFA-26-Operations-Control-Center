export interface MatchPhase {
  name: string;
  startTime: number; // relative to kickoff (0)
  endTime: number;
}

export const matchSchedule: MatchPhase[] = [
  { name: 'Gates Open', startTime: -7200, endTime: -3600 },
  { name: 'Warmups', startTime: -3600, endTime: -900 },
  { name: 'Ceremony', startTime: -900, endTime: -300 },
  { name: 'Kickoff (First Half)', startTime: 0, endTime: 2700 },
  { name: 'Halftime', startTime: 2700, endTime: 3600 },
  { name: 'Second Half', startTime: 3600, endTime: 6300 },
  { name: 'Egress', startTime: 6300, endTime: 10800 }
];
