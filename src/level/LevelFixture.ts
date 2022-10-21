import { Entry } from "@/inanimate/Entry";
import { Portal } from "@/inanimate/Portal";
import { Enemy } from "@/actor/Enemy";
import { Item } from "@/inanimate/Item";
import { NonPlayer } from "@/actor/NonPlayer";

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
