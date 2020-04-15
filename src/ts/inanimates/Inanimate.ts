import Vector from "@/Vector";
import config from "@/config";

/**
 * Inanimates are entities that interact with other entities in the game, but
 * are stationary, and often invisible. e.g. clipping boundaries or portals.
 */
abstract class Inanimate {
  /**
   * Position of the entity
   *
   * @prop {Vector} pos
   */
  public pos: Vector;

  /**
   * Size of the entity
   *
   * @prop {Vector} size
   */
  public size: Vector;

  /**
   * Create and inanimate-based instance
   *
   * @param {Vector} pos  Position of the entity
   * @param {Vector} size Size of the entity
   */
  constructor(pos?: Vector, size?: Vector) {
    this.pos = pos ?? new Vector(0, 0);
    this.size = size ?? new Vector(0, 0);
  }

  /**
   * Update the Inanimate
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {}

  /**
   * Draw the Inanimate
   *
   * @param {CanvasRenderingContext2D} ctx Render context
   */
  public draw(ctx: CanvasRenderingContext2D) {
    if (config.debug) {
      ctx.strokeStyle = "#F00";
      ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
  }
}

export default Inanimate;
