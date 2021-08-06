import Actor from "./Actor";
import Player from "./Player.js";
import Renderable from "@/ui/Renderable";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import { Drawable } from "@/interfaces";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { bus } from "@/EventBus";

/**
 * Main class for baddies
 */
class Enemy extends Actor implements Drawable {
  /**
   * Each sprite of the enemy's movement animation
   */
  private sprites: Renderable[];

  /**
   * Create a new Enemy instance
   *
   * @param position - the enemy's position
   * @param size     - the enemy's size
   * @param template - info about the enemy
   */
  constructor(position: Vector, size: Vector, template: LevelFixtureTemplate) {
    super(position, size, template);

    this.direction = 4;

    let { fps, ratio, scale, sprite } = this.getUiInfo();

    this.sprites = [
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
    ];

    this.resolveState(`enemies.${this.id}`);
  }

  /**
   * Get the string reference to the team type
   */
  get teamType() {
    return this.config?.teamType;
  }

  /**
   * Update the enemy
   *
   * @param dt - delta time
   */
  public update(dt: number) {}

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

    this.sprites[this.direction].draw(ctx, this.position.plus(offset));
  }

  /**
   * Make a clone of the enemy
   *
   * @return the clone
   */
  public clone(): Enemy {
    return new Enemy(this.position.copy(), this.size.copy(), this.template);
  }

  /**
   * Start a fight with the player
   *
   * @param player - player to fight
   *
   * @emits battle.start
   */
  public fight(player: Player) {
    if (this._defeated) {
      return;
    }

    bus.emit("battle.start", {
      player: player,
      enemy: this,
    });
  }

  /**
   * Kill off the enemy
   */
  public kill() {
    this._defeated = true;

    StateManager.getInstance().mergeByRef(`enemies.${this.id}.defeated`, true);
  }
}

export default Enemy;
