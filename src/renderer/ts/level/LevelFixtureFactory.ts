import Clip from "@/inanimate/Clip";
import Enemy from "@/actor/Enemy";
import Entry from "@/inanimate/Entry";
import InvalidDataError from "@/error/InvalidDataError";
import MissingDataError from "@/error/MissingDataError";
import NonPlayer from "@/actor/NonPlayer";
import Portal from "@/inanimate/Portal";
import Vector from "@common/Vector";
import global_config from "@/config";
import items from "@/item/items";
import { Item } from "@/inanimate/Item";
import { animations } from "@/ui/animation/animations";
import { getAnimation } from "@/ui/animation/AnimationFactory";
import {
  isBasicLevelFixtureTemplate,
  isLevelFixtureTemplate,
  LevelFixture,
  LevelFixtureType,
  LevelFixtureTemplate,
} from "./LevelFixture";

const animation_factory = getAnimation(animations);

/**
 * Creates a config for an Item
 *
 * @param template - item template
 *
 * @return config
 *
 * @throws missing data error when it can't locate the config
 */
const create_item_config = (template: LevelFixtureTemplate) => {
  if (!items[template.type]) {
    throw new MissingDataError(
      `Config data for ${template.type} is not defined in items.ts`
    );
  }

  return items[template.type];
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
  public create(type: LevelFixtureType, template: unknown): LevelFixture {
    if (!isBasicLevelFixtureTemplate(template)) {
      throw new MissingDataError(
        `Invalid template used to create a basic level fixture: ${JSON.stringify(
          template
        )}".`
      );
    }

    let position = new Vector(template.x, template.y).times(
      global_config.scale
    );
    let size = new Vector(template.width, template.height).times(
      global_config.scale
    );

    switch (type) {
      case "clip":
        return new Clip(position, size);
      case "entry":
        return new Entry(position, size);
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
        return new Portal(position, size, template);
      case "npc":
        return new NonPlayer(position, size, template);
      case "enemy":
        let enemy = new Enemy(position, size, template);
        // If the enemy is previously defeated, set to null to be cleared
        return enemy.isDefeated ? null : enemy;
      case "item":
        let item = new Item(
          position,
          size,
          template,
          create_item_config,
          animation_factory
        );
        // If the item is previously obtained, set to null to be cleared
        return item.obtained ? null : item;
      default:
        throw new InvalidDataError(
          `Unable to create fixture for object type "${type}".`
        );
    }
  }
}