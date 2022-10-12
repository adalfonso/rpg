import Inanimate from "./Inanimate";
import MissingDataError from "@/error/MissingDataError";
import { Vector } from "excalibur";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
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
   * @param position - position of the portal
   * @param size     - size of the portal
   * @param template - info about the portal
   *
   * @throws {MissingDataError} when properties or to/from are missing
   */
  constructor(position: Vector, size: Vector, template: LevelFixtureTemplate) {
    super(position, size);

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
