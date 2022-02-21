import StateManager from "./StateManager";

/**
 * Represents key milestones in the game
 *
 * e.g. beating a boss, a new member joining your team
 */
export class Milestone {
  /** If the milestone has been obtained */
  private _obtained = false;

  /**
   * @param _id - id ref of the milestone
   */
  constructor(private _id: string) {
    this.resolveState(`milestones.${this._id}`);
  }

  /** Obtain the milestone */
  public obtain() {
    if (this._obtained) {
      return;
    }

    this._obtained = true;

    StateManager.getInstance().mergeByRef(
      `milestones.${this._id}`,
      this.getState()
    );
  }

  get obtained() {
    return this._obtained;
  }

  /**
   * Resolve the current state of the milestone in comparison to the game state
   *
   * @param ref - reference to where in the state the milestone is stored
   *
   * @return milesstone data as stored in the state
   */
  private resolveState(ref: string) {
    const state = StateManager.getInstance();
    const data = state.get(ref);

    if (data === undefined) {
      state.mergeByRef(ref, this.getState());
      return state.get(ref);
    }

    if (data["obtained"]) {
      this._obtained = true;
    }

    return data;
  }

  /**
   * Get current state of the milestone
   *
   * @return current state of the milestone
   */
  private getState(): Record<string, unknown> {
    return { obtained: this._obtained };
  }
}
