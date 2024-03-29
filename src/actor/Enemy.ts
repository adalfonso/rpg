import * as ex from "excalibur";
import { Actor } from "./Actor";
import { Player } from "./Player";
import { TiledTemplate } from "./types";
import { bus } from "@/event/EventBus";
import { state } from "@/state/StateManager";

/** Main class for baddies */
export class Enemy extends Actor {
  /**
   * Create a new Enemy instance
   *
   * @param template - info about the enemy
   */
  constructor(template: TiledTemplate) {
    super(template, { collisionType: ex.CollisionType.Fixed });

    this._resolveState();

    this.on("collisionstart", (evt) => {
      if (!(evt.other instanceof Player)) {
        return;
      }

      this.fight();
    });
  }

  /** State lookup key */
  get state_ref() {
    return `enemies.${this.ref}`;
  }

  /** Get the string reference to the team type */
  get teamType() {
    return this.config?.teamType;
  }

  /**
   * Make a clone of the enemy
   *
   * @return the clone
   */
  public async cloneAsync() {
    return new Enemy(this.template).init();
  }

  /**
   * Start a fight with the player
   *
   * @emits battle.start
   */
  public fight() {
    if (this._defeated || this.in_combat) {
      return;
    }

    bus.emit("battle.start", { enemy: this });
  }

  /** Kill off the enemy */
  public kill() {
    this._defeated = true;

    state().mergeByRef(this.state_ref, this.state);
    super.kill();
  }
}
