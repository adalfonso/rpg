import Entry from "@/inanimate/Entry";
import Portal from "@/inanimate/Portal";
import { Enemy } from "@/actor/Enemy";
import { Item } from "@/inanimate/Item";
import { NonPlayer } from "@/actor/NonPlayer";
import { isRecord } from "@/types";

/** Available types of level fixtures */
export enum LevelFixtureType {
  Enemy = "enemy",
  Portal = "portal",
  NonPlayer = "npc",
  Entry = "entry",
  Item = "item",
}

export const isLevelFixtureType = (name: string): name is LevelFixtureType =>
  Object.values(LevelFixtureType).includes(name as LevelFixtureType);

/** Type classes of fixtures to expect in a level */
export type LevelFixture = Enemy | Portal | NonPlayer | Entry | Item;

/** Most basic template for a level fixture */
export interface BasicLevelFixtureTemplate {
  x: number;
  y: number;
  height: number;
  width: number;
}

/** Custom props added to a level fixture */
export interface LevelFixtureProperty {
  name: string;
  type: string;
  value: string;
}

/** More advanced level fixture template */
export interface LevelFixtureTemplate extends BasicLevelFixtureTemplate {
  name: string;
  class: string;
  properties?: LevelFixtureProperty[];
}

/**
 * Determine if template supports a basic level fixture
 *
 * @param template - fixture template
 *
 * @return if it can support a basic fixture
 */
export const isBasicLevelFixtureTemplate = (
  template: unknown
): template is BasicLevelFixtureTemplate =>
  typeof template === "object" &&
  template !== null &&
  typeof template["x"] === "number" &&
  typeof template["y"] === "number" &&
  typeof template["height"] === "number" &&
  typeof template["width"] === "number";

/**
 * Determine if the property match the correct shape
 * @param prop - template property
 *
 * @returns if the property is valid
 */
const isLevelFixtureProperty = (prop: unknown) =>
  typeof prop === "object" &&
  prop !== null &&
  typeof prop["name"] === "string" &&
  typeof prop["type"] === "string" &&
  typeof prop["value"] === "string";

/**
 * Determine if template supports anadvanced level fixture
 *
 * @param template - fixture template
 *
 * @return if it can support a basic fixture
 */
export const isLevelFixtureTemplate = (
  template: unknown
): template is LevelFixtureTemplate => {
  if (!isRecord(template)) {
    return false;
  }

  const hasValidProperties = Array.isArray(template["properties"])
    ? template["properties"].filter((prop) => !isLevelFixtureProperty(prop))
        .length === 0
    : template["properties"] === undefined;

  return (
    hasValidProperties &&
    isBasicLevelFixtureTemplate(template) &&
    typeof template["name"] === "string" &&
    typeof template["class"] === "string"
  );
};

/**
 * Lookup a property value
 *
 * TODO: This should be changed to work with the Tiled types
 *
 * @param lookup - propeties
 * @param name - lookup name
 *
 * @returns property value
 */
export const levelPropertyLookup =
  (lookup: LevelFixtureProperty[]) => (name: string) =>
    lookup
      .filter((record) => record.name === name)
      .map((record) => record.value)[0];
