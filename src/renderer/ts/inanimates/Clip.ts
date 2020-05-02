import Inanimate from "./Inanimate";
import Vector from "@common/Vector";

/**
 * A clip is an area of the map that entities cannot traverse. e.g. a wall.
 */
class Clip extends Inanimate {
  /**
   * Create a new clip instance
   *
   * @param {Vector} position The clip's position
   * @param {Vector} size     The clip's size
   */
  constructor(position: Vector, size: Vector) {
    super(position, size);
  }

  /**
   * Draw the clip
   *
   * @param {CanvasRenderingContext2D} ctx Render context
   */
  public draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }
}

export default Clip;
