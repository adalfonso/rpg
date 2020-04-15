import Inanimate from "./Inanimate";
import Vector from "@/Vector";

/**
 * Portal is an invisible area on the map which transports entities that enter
 * it into a different area.
 */
class Portal extends Inanimate {
  /**
   * Coordinates of the portal
   *
   * @prop {Vector} pos
   */
  public pos: Vector;

  /**
   * Size of the portal
   *
   * @prop {Vector} size
   */
  public size: Vector;

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
   * @param {Vector} pos
   * @param {Vector} size
   * @param obj
   */
  constructor(pos: Vector, size: Vector, obj) {
    super(pos, size);

    if (!obj.properties) {
      throw "Cannot from from/to when creating portal.";
    }

    /**
     * Sets to/from properties
     * TODO: Input should be more concise. At some point wrap map data in some
     * class so we can make assumptions about the input data.
     */
    obj.properties.forEach((prop) => {
      this[prop.name] = prop.value;
    });
  }

  /**
   * Draw Portal and all underlying entities. Portals aren't drawn per se, but
   * we can hand off drawing to the parent class in case a debug draw is needed.
   *
   * @param {CanvasRenderingContext2D} ctx Render context
   */
  public draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }
}

export default Portal;
