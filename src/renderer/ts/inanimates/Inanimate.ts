import Vector from "@common/Vector";
import config from "@/config";

/**
 * Inanimates are entities that interact with other entities in the game, but
 * are stationary, and often invisible. e.g. clipping boundaries or portals.
 */
abstract class Inanimate {
  /**
   * Position of the inanimate
   *
   * @prop {Vector} pos
   */
  public position: Vector;

  /**
   * Size of the inanimate
   *
   * @prop {Vector} size
   */
  public size: Vector;

  /**
   * Create an Inanimate-based instance
   *
   * @param {Vector} position  Position of the inanimate
   * @param {Vector} size      Size of the inanimate
   */
  constructor(position?: Vector, size?: Vector) {
    this.position = position ?? new Vector(0, 0);
    this.size = size ?? new Vector(0, 0);
  }

  /**
   * Update the inanimate
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {}

  /**
   * Draw the inanimate
   *
   * @param {CanvasRenderingContext2D} ctx Render context
   */
  public draw(ctx: CanvasRenderingContext2D) {
    if (config.debug) {
      this.debugDraw(ctx);
    }
  }

  /**
   * Force some sort of render
   *
   * @param {CanvasRenderingContext2D} ctx Render context
   */
  protected debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#F00";
    ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
  }
}

export default Inanimate;
