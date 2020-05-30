import Vector from "@common/Vector";
import config from "@/config";

/**
 * An entity that interacts with other entities in the game
 *
 * Inanimates are stationary, and often invisible. e.g. clipping boundaries or
 * portals.
 */
abstract class Inanimate {
  /**
   * Create an Inanimate-based instance
   *
   * @param position - position of the inanimate
   * @param size     - size of the inanimate
   */
  constructor(
    public position: Vector = new Vector(0, 0),
    public size: Vector = new Vector(0, 0)
  ) {}

  /**
   * Update the inanimate
   *
   * @param dt - delta time
   */
  public update(dt: number) {}

  /**
   * Draw the inanimate
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
    if (config.debug) {
      this.debugDraw(ctx, offset, resolution);
    }
  }

  /**
   * Force some sort of render
   *
   * @param ctx         - render context
   * @param offset      - render position offset
   * @param _resolution - render resolution
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
