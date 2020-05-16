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
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (config.debug) {
      this.debugDraw(ctx, offset, resolution);
    }
  }

  /**
   * Force some sort of render
   *
   * @param {CanvasRenderingContext2D} ctx         Render context
   * @param {Vector}                   offset      Render position offset
   * @param {Vector}                   _resolution Render resolution
   */
  protected debugDraw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution: Vector
  ) {
    let position = this.position.plus(offset);

    ctx.save();
    ctx.strokeStyle = "#FF0";
    ctx.strokeRect(position.x, position.y, this.size.x, this.size.y);
    ctx.restore();
  }
}

export default Inanimate;
