import MissingDataError from "@/error/MissingDataError";
import StateManager from "../StateManager";
import { MilestoneConfig, MilestoneResolution, MilestoneType } from "./types";
import { bus } from "@/EventBus";
import { milestone_list } from "./milestones";

/**
 * Represents key milestones in the game
 *
 * e.g. beating a boss, a new member joining your team
 */
export class Milestone {
  /** If the milestone has been attained */
  private _attained = false;

  /** Config data */
  private _config: MilestoneConfig;

  /**
   * @param _id - id ref of the milestone
   */
  constructor(private _id: string) {
    this._config = milestone_list[_id];

    if (this._config === undefined) {
      throw new MissingDataError(`Cannot locate milestone for ref "${_id}"`);
    }

    this.resolveState(`milestones.${this._id}`);
  }

  /** Attain the milestone */
  public attain(target: MilestoneResolution) {
    if (this._attained) {
      return;
    }

    if (this._config.type === MilestoneType.NewTeamMember) {
      bus.emit("team.newMember", { target });
    }

    this._attained = true;

    StateManager.getInstance().mergeByRef(
      `milestones.${this._id}`,
      this.getState()
    );
  }

  /** If the milestone has been attained (completed) */
  get attained() {
    return this._attained;
  }

  /** Criteria to attain milestone on */
  get attain_on() {
    return this._config.attain_on;
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
      return state.mergeByRef(ref, this.getState());
    }

    if (data["attained"]) {
      this._attained = true;
    }

    return data;
  }

  /**
   * Get current state of the milestone
   *
   * @return current state of the milestone
   */
  private getState(): Record<string, unknown> {
    return { attained: this._attained };
  }
}
