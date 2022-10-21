import * as ex from "excalibur";
import { Player } from "@/actor/Player";
import { TiledTemplate } from "@/actor/types";
import { bus } from "@/event/EventBus";

/**
 * An invisible area on the map
 *
 * Portals transport entities that enter it into a different area.
 */
export class Portal extends ex.Actor {
  /** Reference to the current area's name */
  public from: string;

  /** Reference to the name of the area that the portal leads to */
  public to: string;

  /**
   * Create a new Portal instance
   *
   * @param template - info about the portal
   *
   * @throws {MissingDataError} when properties or to/from are missing
   */
  constructor(template: TiledTemplate) {
    super({ ...template, collisionType: ex.CollisionType.Passive });

    const to = template.getProperty("to");
    const from = template.getProperty("from");

    if (to === undefined) {
      throw new Error(`Template missing required property "to"`);
    }

    if (from === undefined) {
      throw new Error(`Template missing required property "from"`);
    }

    this.to = to.value as string;
    this.from = from.value as string;

    this.on("collisionstart", (evt) => {
      if (!(evt.other instanceof Player)) {
        return;
      }

      bus.emit("portal.enter", { portal: this });
    });
  }
}
