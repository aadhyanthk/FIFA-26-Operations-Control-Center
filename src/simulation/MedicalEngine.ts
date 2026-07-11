import type { StadiumState } from '../store/stadiumStore';

export class MedicalEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    return state;
  }
}
