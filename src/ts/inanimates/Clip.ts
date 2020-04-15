import Inanimate from "./Inanimate";
import Vector from "@/Vector";

/**
 * A clip is an area of the map that entities cannot traverse. e.g. a wall.
 */
class Clip extends Inanimate {
  /**
   * Position of the clip
   *
   * @prop {Vector} pos
   */
  public pos: Vector;

  /**
   * Size of the clip
   *
   * @prop {Vector} size
   */
  public size: Vector;

  /**
   * Create a new clip instance
   *
   * @param {Vector} pos  The clip's position
   * @param {Vector} size The clip's size
   */
  constructor(pos: Vector, size: Vector) {
    super(pos, size);
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
