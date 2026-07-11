import { StadiumState } from '../store/stadiumStore';

export class SecurityEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    return state;
  }
}
