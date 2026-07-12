import type { StadiumState } from '../store/stadiumStore';

export class CleaningEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    return {};
  }
}
