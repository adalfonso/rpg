import Actor from "./Actor";
import Player from "./Player.js";
import Renderable from "@/Renderable";
import StatManager from "@/StatManager";
import Vector from "@common/Vector";
import { Drawable } from "@/interfaces";
import { bus } from "@/EventBus";

/**
 * Main class for baddies
 */
class Enemy extends Actor implements Drawable {
  /**
   * An array of renderables for each sprite of the enemy's movement animation
   *
   * @prop {Renderable[]} sprites
   */
  private sprites: Renderable[];

  /**
   * If the enemy has been defeated
   *
   * @prop {boolean} defeated
   */
  public defeated: boolean;

  /**
   * Create a new Enemy instance
   *
   * @param {object} data Info about the enemy
   */
  constructor(data) {
    super(
      new Vector(data.x, data.y),
      new Vector(data.width, data.height),
      data
    );

    this.stats = new StatManager(this.config.baseStats);
    this.defeated = false;

    let { fps, ratio, scale, sprite } = this.getUiInfo();

    this.sprites = [
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
    ];

    this.direction = 4;

    this.stats = new StatManager(this.config.baseStats);

    this.resolveState(`enemies.${this.id}`);
  }

  /**
   * Update the enemy
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {}

  /**
   * Draw Enemy and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (this.defeated) {
      return;
    }

    super.draw(ctx, offset, resolution);

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    this.sprites[this.direction].draw(ctx);

    ctx.restore();
  }

  /**
   * Start a fight with the player
   *
   * @param {Player} player Player to fight
   */
  public fight(player: Player) {
    if (this.defeated) {
      return;
    }

    bus.emit("battle.start", {
      player: player,
      enemy: this,
    });
  }
}

export default Enemy;
