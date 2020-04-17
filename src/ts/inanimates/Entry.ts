import Inanimate from "./Inanimate";
import Vector from "@/Vector";

/**
 * An Entry is an area on the map that an entity can be loaded on.
 */
class Entry extends Inanimate {
  /**
   * Name of the entry. A reference which usually corresponds to the area from
   * where the entity previously was.
   */
  private name: string;

  /**
   * Create a new Entry instance
   *
   * @param {Vector} position The entry's position
   * @param {Vector} size     The entry's size
   * @param {object} data     Info about the entry
   */
  constructor(position: Vector, size: Vector, data) {
    super(position, size);

    this.name = data.name;
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
