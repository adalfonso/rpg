import * as Tiled from "@excaliburjs/plugin-tiled";
import Entry from "@/inanimate/Entry";
import InvalidDataError from "@/error/InvalidDataError";
import MissingDataError from "@/error/MissingDataError";
import Portal from "@/inanimate/Portal";
import global_config from "@/config";
import items from "@/item/items";
import { Enemy } from "@/actor/Enemy";
import { Item } from "@/inanimate/Item";
import { NonPlayer } from "@/actor/NonPlayer";
import { animations } from "@/ui/animation/animations";
import { getAnimationFromName } from "@/ui/animation/AnimationFactory";
import { isTiledClassObject, TiledClassObject } from "@/actor/types";
import {
  isBasicLevelFixtureTemplate,
  isLevelFixtureTemplate,
  LevelFixtureType,
} from "./LevelFixture";

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
const create_item_config = (template: TiledClassObject) => {
  return items[template.class];
};

/** Create a level fixture based on a type and a template */
export class LevelFixtureFactory {
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
  public create(
    type: LevelFixtureType,
    template: Tiled.TiledObject,
    game: ex.Engine
  ) {
    if (!isTiledClassObject(template)) {
      throw new MissingDataError(
        `Tiled Object is missing "class": ${template.name}`
      );
    }

    if (!isBasicLevelFixtureTemplate(template)) {
      throw new MissingDataError(
        `Invalid template used to create a basic level fixture: ${JSON.stringify(
          template
        )}".`
      );
    }

    const { scale } = global_config;

    switch (type) {
      case "entry":
        return new Entry(template);
    }

    if (!isLevelFixtureTemplate(template)) {
      throw new MissingDataError(
        `Invalid template used to create a level fixture: ${JSON.stringify(
          template
        )}".`
      );
    }

    switch (type) {
      case "portal":
        return new Portal(template);
      case "npc": {
        const npc = new NonPlayer(template, game);

        // If the npc is expired, set to null to be cleared
        return npc.isExpired ? null : npc;
      }
      case "enemy": {
        const enemy = new Enemy(template, game);
        // If the enemy is previously defeated, set to null to be cleared
        return enemy.isDefeated ? null : enemy;
      }
      case "item": {
        const item = new Item(
          template,
          create_item_config,
          game,
          animation_factory
        );
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
