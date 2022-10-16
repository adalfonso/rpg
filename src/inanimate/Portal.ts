import Inanimate from "./Inanimate";
import MissingDataError from "@/error/MissingDataError";
import { ActorInitArgs } from "@/actor/types";
import { vec } from "excalibur";

/**
 * An invisible area on the map
 *
 * Portals transport entities that enter it into a different area.
 */
class Portal extends Inanimate {
  /** Reference to the current area's name */
  public from = "";

  /** Reference to the name of the area that the portal leads to */
  public to = "";

  /**
   * Create a new Portal instance
   *
   * @param template - info about the portal
   *
   * @throws {MissingDataError} when properties or to/from are missing
   */
  constructor(template: ActorInitArgs) {
    const { x, y, width, height } = template;
    super(vec(x ?? 0, y ?? 0), vec(width ?? 0, height ?? 0));

    /**
     * Sets to/from properties
     *
     * TODO: Input should be more concise. At some point wrap map data in some
     * class so we can make assumptions about the input data.
     */
    template.properties?.forEach((prop) => {
      this[prop.name] = prop.value;
    });

    if (!this.from || !this.to) {
      throw new MissingDataError("Cannot find from/to when creating portal.");
    }
  }
}

export default Portal;
