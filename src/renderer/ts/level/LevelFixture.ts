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

/** More advanced level fixture template */
export interface LevelFixtureTemplate extends BasicLevelFixtureTemplate {
  name: string;
  type: string;
  properties?: Record<string, unknown>[];
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
 * Determine if template supports anadvanced level fixture
 *
 * @param template - fixture template
 *
 * @return if it can support a basic fixture
 */
export const isLevelFixtureTemplate = (
  template: unknown
): template is LevelFixtureTemplate =>
  isBasicLevelFixtureTemplate(template) &&
  typeof template["name"] === "string" &&
  typeof template["type"] === "string" &&
  ["undefined", "object"].includes(typeof template["properties"]);
