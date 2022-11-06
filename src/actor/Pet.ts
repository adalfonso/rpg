import { Actor } from "./Actor";
import { Direction } from "@/ui/types";
import { Vector } from "excalibur";

interface FollowUpdate {
  position: Vector;
  direction: Direction;
  dt: number;
}

/** Pets are actors that belong to other actors */
export class Pet extends Actor {
  /** Duration in ms the pet trails its owner by */
  private _trailing_delay_ms = 1000;

  /** Record of all positions the pet will mimin */
  private _position_queue: FollowUpdate[] = [];

  /** Kill off a pet */
  public kill() {
    // TODO: pets cannot be killed yet
    super.kill();
  }

  /**
   * Queue a follow update for the pet
   *
   * @param update - update data, e.g. position, direction
   */
  public follow(update: FollowUpdate) {
    this._position_queue = [...this._position_queue, update];
  }

  /**
   * Move pet to a position
   *
   * Overrides Entity mixin
   *
   * @param position - position to move to
   * @param force - force clear the position queue
   */
  public moveTo(position: ex.Vector, force = false) {
    this.pos = position.clone();

    if (force) {
      this._position_queue = [];
    }
  }

  /**
   * Update the pet's position and direction
   *
   * Normally an Actor controls its own update but Pets are given their update
   * through the follow method which is consumed here during an update.
   *
   * @param _engine - game engine instance
   * @param _dt delta time - unused
   */
  public onPostUpdate(_engine: ex.Engine, _dt: number) {
    if (this._getQueueDurationMs() < this._trailing_delay_ms) {
      return;
    }

    const [update, ...rest] = this._position_queue;
    const { position, direction } = update;

    this.moveTo(position);
    this._direction = direction;
    this._position_queue = rest;
  }

  /**
   * Get the entire duration in ms represented by the queue
   *
   * @returns queue duration in ms
   */
  private _getQueueDurationMs() {
    return this._position_queue.reduce((carry, update) => {
      return carry + update.dt;
    }, 0);
  }
}
