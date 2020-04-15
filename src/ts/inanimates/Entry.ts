import Inanimate from "./Inanimate";
import Vector from "@/Vector";

/**
 * An Entry is an area on the map that an entity can be loaded on.
 */
class Entry extends Inanimate {
  /**
   * Position of the entry
   *
   * @prop {Vector} pos
   */
  public pos: Vector;

  /**
   * Size of the entry
   *
   * @prop {Vector} size
   */
  public size: Vector;

  /**
   * Name of the entry. A reference which usually corresponds to the area from
   * where the entity previously was.
   */
  private name: string;

  /**
   * Create a new Entry instance
   *
   * @param {Vector} pos  The entry's position
   * @param {Vector} size The entry's size
   * @param {object} obj  Data object with more information about the entry
   */
  constructor(pos: Vector, size: Vector, obj) {
    super(pos, size);

    this.name = obj.name;
  }

  /**
   * Draw the entry
   *
   * @param {CanvasRenderingContext2D} ctx Render context
   */
  public draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }
}

export default Entry;
