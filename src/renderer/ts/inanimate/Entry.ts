import Inanimate from "./Inanimate";
import Vector from "@common/Vector";

/** An area on the map that an entity can be loaded on */
class Entry extends Inanimate {
  /**
   * Create a new Entry instance
   *
   * @param position - the entry's position
   * @param size     - the entry's size
   */
  constructor(position: Vector, size: Vector) {
    super(position, size);
  }
}

export default Entry;
