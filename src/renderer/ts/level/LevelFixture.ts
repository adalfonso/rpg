import Clip from "@/inanimate/Clip";
import Enemy from "@/actor/Enemy";
import Entry from "@/inanimate/Entry";
import NonPlayer from "@/actor/NonPlayer";
import Portal from "@/inanimate/Portal";
import { Item } from "@/inanimate/Item";

/** Available types of level fixtures */
export enum LevelFixtureType {
  Clip = "clip",
  Enemy = "enemy",
  Portal = "portal",
  NonPlayer = "npc",
  Entry = "entry",
  Item = "item",
}

/** Type classes of fixtures to expect in a level */
export type LevelFixture = Clip | Enemy | Portal | NonPlayer | Entry | Item;

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
  type: string;
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
  const hasValidProperties = Array.isArray(template["properties"])
    ? template["properties"].filter((prop) => !isLevelFixtureProperty(prop))
        .length === 0
    : template["properties"] === undefined;

  return (
    isBasicLevelFixtureTemplate(template) &&
    typeof template["name"] === "string" &&
    typeof template["type"] === "string" &&
    hasValidProperties
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
