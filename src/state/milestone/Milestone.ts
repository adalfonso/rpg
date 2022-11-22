import MissingDataError from "@/error/MissingDataError";
import { MilestoneConfig, MilestoneResolution, MilestoneType } from "./types";
import { Stateful } from "@/interfaces";
import { bus } from "@/event/EventBus";
import { milestones } from "./milestones";
import { state } from "../StateManager";
import {
  isMilestoneState,
  MilestoneState,
} from "../schema/state/milestone/MilestoneSchema";

/**
 * Represents key milestones in the game
 *
 * e.g. beating a boss, a new member joining your team
 */
export class Milestone implements Stateful<MilestoneState> {
  /** If the milestone has been attained */
  private _attained = false;

  /** Config data */
  private _config: MilestoneConfig;

  /**
   * @param ref - id ref of the milestone
   */
  constructor(readonly ref: string) {
    this._config = milestones()[ref];

    if (this._config === undefined) {
      throw new MissingDataError(`Cannot locate milestone for ref "${ref}"`);
    }

    this._resolveState();
  }

  /** State lookup key */
  // TODO: need to detect collisions with state
  get state_ref() {
    return `milestones.${this.ref}`;
  }

  /** Attain the milestone */
  public attain(target: MilestoneResolution) {
    if (this._attained) {
      return;
    }

    if (this._config.type === MilestoneType.NewTeamMember) {
      bus.emit("team.newMember", { target });
    }

    if (this._config.dialogue) {
      bus.emit("dialogue.create", { speech: this._config.dialogue });
    }

    this._attained = true;

    state().mergeByRef(this.state_ref, this.state);
  }

  /** If the milestone has been attained (completed) */
  get attained() {
    return this._attained;
  }

  /** Criteria to attain milestone on */
  get attain_on() {
    return this._config.attain_on;
  }

  /** Current data state */
  get state(): MilestoneState {
    return { attained: this._attained };
  }

  /**
   * Resolve the current state of the milestone in comparison to the game state
   *
   * @return milesstone data as stored in the state
   */
  private _resolveState() {
    const data = state().resolve(this, isMilestoneState);

    this._attained = data.attained;

    return data;
  }
}
