import Inanimate from "./Inanimate";
import MissingDataError from "@/error/MissingDataError";
import Vector from "@common/Vector";

/**
 * Portal is an invisible area on the map which transports entities that enter
 * it into a different area.
 */
class Portal extends Inanimate {
  /**
   * Reference to the current area's name
   *
   * @prop {string} from
   */
  public from: string;

  /**
   * Reference to the name of the area that the portal leads to
   *
   * @prop {string} to
   */
  public to: string;

  /**
   * Create a new Portal instance
   *
   * @param  {Vector} position Position of the portal
   * @param  {Vector} size     Size of the portal
   * @param  {object} data     Info about the portal
   *
   * @throws {MissingDataError} When properties or to/from are missing
   */
  constructor(position: Vector, size: Vector, data: any) {
    super(position, size);

    if (!data.properties) {
      throw new MissingDataError(
        `Cannot find "properties" object when creating portal.`
      );
    }

    /**
     * Sets to/from properties
     * TODO: Input should be more concise. At some point wrap map data in some
     * class so we can make assumptions about the input data.
     */
    data.properties.forEach((prop) => {
      this[prop.name] = prop.value;
    });

    if (!this.from || !this.to) {
      throw new MissingDataError("Cannot find from/to when creating portal.");
    }
  }
}

export default Portal;
