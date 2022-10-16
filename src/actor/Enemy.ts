import Renderable from "@/ui/Renderable";
import { Actor } from "./Actor";
import { ActorInitArgs } from "./types";
import { Direction } from "@/ui/types";
import { HeroTeam } from "@/combat/HeroTeam";
import { bus } from "@/event/EventBus";
import { state } from "@/state/StateManager";

/** Main class for baddies */
export class Enemy extends Actor {
  /** Each sprite of the enemy's movement animation */
  protected sprites: Renderable[];

  /**
   * Create a new Enemy instance
   *
   * @param template - info about the enemy
   */
  constructor(template: ActorInitArgs) {
    super(template);

    // TODO: make configurable when needed
    this.direction = Direction.West;

    const { fps, ratio, scale, sprite } = this.getUiInfo();

    // TODO: hardcode these for now
    this.sprites = [
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
    ];

    this._resolveState();
  }

  /** State lookup key */
  get state_ref() {
    return `enemies.${this.ref_id}`;
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
  public clone(): Enemy {
    return new Enemy(this.template);
  }

  /**
   * Start a fight with the player
   *
   * @param player - player to fight
   *
   * @emits battle.start
   */
  public fight(heroes: HeroTeam) {
    if (this._defeated) {
      return;
    }

    bus.emit("battle.start", {
      heroes,
      enemy: this,
    });
  }

  /** Kill off the enemy */
  public kill() {
    this._defeated = true;

    state().mergeByRef(`enemies.${this.ref_id}.defeated`, true);
  }
}
