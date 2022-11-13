import * as Tiled from "@excaliburjs/plugin-tiled";
import InvalidDataError from "@/error/InvalidDataError";
import MissingDataError from "@/error/MissingDataError";
import items from "@/item/items";
import { Enemy } from "@/actor/Enemy";
import { Entry } from "@/inanimate/Entry";
import { Item } from "@/inanimate/Item";
import { FixtureType } from "./Fixture";
import { NonPlayer } from "@/actor/NonPlayer";
import { Portal } from "@/inanimate/Portal";
import { animations } from "@/ui/animation/animations";
import { getAnimationFromName } from "@/ui/animation/AnimationFactory";
import { isTiledTemplate, TiledTemplate } from "@/actor/types";

const animation_factory = getAnimationFromName(animations);

/**
 * Creates a config for an Item
 *
 * @param template - item template
 *
 * @return config
 *
 * @throws missing data error when it can't locate the config
 */
const create_item_config = (template: TiledTemplate) => {
  return items[template.class];
};

/** Create a level fixture based on a type and a template */
export class FixtureFactory {
  /**
   * Load a single fixture from a layer object
   *
   * @param type     - fixture type
   * @param template - fixture template
   *
   * @return resulting fixture instance
   *
   * @throws {MissingDataError} when x, y, width, or height are missing
   * @throws {InvalidDataError} when the type is invalid
   */
  public async create(type: FixtureType, template: Tiled.TiledObject) {
    if (!isTiledTemplate(template)) {
      throw new MissingDataError(
        `Provided template is not Tiled Template.` +
          `It may be missing a required property like "class", "height", or "width": ${JSON.stringify(
            template
          )}`
      );
    }

    // Offset position due to excalibur's center anchor
    template.x = template.x + Math.round(template.width / 2);
    template.y = template.y + Math.round(template.height / 2);

    switch (type) {
      case "entry":
        return new Entry(template);
      case "portal":
        return new Portal(template);
      case "npc": {
        const npc = new NonPlayer(template);

        // If the npc is expired, set to null to be cleared
        return npc.isExpired ? null : npc;
      }
      case "enemy": {
        const enemy = new Enemy(template);
        // If the enemy is previously defeated, set to null to be cleared
        return enemy.isDefeated ? null : enemy;
      }
      case "item": {
        const item = new Item(template, create_item_config, animation_factory);
        // If the item is previously obtained, set to null to be cleared
        return item.obtained ? null : item;
      }
      default:
        throw new InvalidDataError(
          `Unable to create fixture for object type "${type}".`
        );
    }
  }
}
