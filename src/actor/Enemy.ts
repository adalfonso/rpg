import Actor from "./Actor";
import Renderable from "@/ui/Renderable";
import Vector from "@/physics/math/Vector";
import { Direction } from "@/ui/types";
import { HeroTeam } from "@/combat/HeroTeam";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { bus } from "@/event/EventBus";
import { state } from "@/state/StateManager";

/** Main class for baddies */
class Enemy extends Actor {
  /** Each sprite of the enemy's movement animation */
  protected sprites: Renderable[];

  /**
   * Create a new Enemy instance
   *
   * @param _position - the enemy's position
   * @param _size     - the enemy's size
   * @param template - info about the enemy
   */
  constructor(
    _position: Vector,
    _size: Vector,
    template: LevelFixtureTemplate
  ) {
    super(_position, _size, template);

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
    return `enemies.${this.id}`;
  }

  /** Get the string reference to the team type */
  get teamType() {
    return this.config?.teamType;
  }

  /**
   * Draw Enemy and all underlying entities
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (this._defeated) {
      return;
    }

    super.draw(ctx, offset, resolution);

    this.sprites[this.direction].draw(ctx, this._position.plus(offset));
  }

  /**
   * Make a clone of the enemy
   *
   * @return the clone
   */
  public clone(): Enemy {
    return new Enemy(this._position.copy(), this.size.copy(), this.template);
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

    state().mergeByRef(`enemies.${this.id}.defeated`, true);
  }
}

export default Enemy;
