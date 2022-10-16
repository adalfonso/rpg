import Inanimate from "./Inanimate";
import { ActorInitArgs } from "@/actor/types";
import { vec } from "excalibur";

/** An area on the map that an entity can be loaded on */
class Entry extends Inanimate {
  /**
   * Create a new Entry instance
   *
   * @param template - info about the entry
   */
  constructor(template: ActorInitArgs) {
    const { x, y, width, height } = template;
    super(vec(x ?? 0, y ?? 0), vec(width ?? 0, height ?? 0));
  }
}

export default Entry;
