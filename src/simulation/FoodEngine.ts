import type { StadiumState } from '../store/stadiumStore';

export class FoodEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    return state;
  }
}
