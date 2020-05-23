import Inanimate from "./Inanimate";
import Vector from "@common/Vector";

/**
 * An Entry is an area on the map that an entity can be loaded on.
 */
class Entry extends Inanimate {
  /**
   * Create a new Entry instance
   *
   * @param {Vector} position The entry's position
   * @param {Vector} size     The entry's size
   * @param {object} data     Info about the entry
   */
  constructor(position: Vector, size: Vector, data: any) {
    super(position, size);
  }
}

export default Entry;
