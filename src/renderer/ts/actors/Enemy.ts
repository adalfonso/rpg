import Actor from "./Actor";
import Dialogue from "@/Dialogue";
import Player from "./Player.js";
import Renderable from "@/Renderable";
import StatManager from "@/StatManager";
import Vector from "@common/Vector";
import enemies from "./enemies.json";
import { Drawable } from "@/interfaces";
import { bus } from "@/EventBus";
import { getImagePath } from "@/Util/loaders";

/**
 * Main class for baddies
 */
class Enemy extends Actor implements Drawable {
  /**
   * Info about the enemy
   * TODO: Make the type of data more specific
   *
   * @prop {object} data
   */
  private data: any;

  /**
   * Dialogue that the enemy is the leader of
   *
   * @prop {Dialogue} dialogue
   */
  private dialogue: Dialogue;

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

    let enemy = enemies[data.type];

    if (!enemy) {
      throw new Error(`Enemy data for ${name} is not defined in enemies.json`);
    }

    this.data = enemy;
    this.dialogue = null;
    this.stats = new StatManager(enemy.default.stats);
    this.defeated = false;

    let sprite = getImagePath(enemy.ui.sprite);
    let ratio = new Vector(enemy.ui.frames.x, enemy.ui.frames.y);

    this.sprites = [
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      new Renderable(sprite, enemy.ui.scale, 0, 8, ratio, enemy.ui.fps),
      new Renderable(sprite, enemy.ui.scale, 0, 8, ratio, enemy.ui.fps),
      new Renderable(sprite, enemy.ui.scale, 0, 8, ratio, enemy.ui.fps),
      new Renderable(sprite, enemy.ui.scale, 0, 8, ratio, enemy.ui.fps),
      new Renderable(sprite, enemy.ui.scale, 0, 8, ratio, enemy.ui.fps),
    ];

    this.direction = 4;

    this.resolveState(`enemies.${this.id}`);
  }

  /**
   * Get the name used when rendering dialogue
   *
   * @prop {string} dialogueName
   */
  get dialogueName(): string {
    return this.data.display_name;
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
