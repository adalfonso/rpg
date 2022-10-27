import { Entry } from "@/inanimate/Entry";
import { Portal } from "@/inanimate/Portal";
import { Enemy } from "@/actor/Enemy";
import { Item } from "@/inanimate/Item";
import { NonPlayer } from "@/actor/NonPlayer";

/** Available types of level fixtures */
export enum FixtureType {
  Enemy = "enemy",
  Portal = "portal",
  NonPlayer = "npc",
  Entry = "entry",
  Item = "item",
}

export const isFixtureType = (name: string): name is FixtureType =>
  Object.values(FixtureType).includes(name as FixtureType);

/** Type classes of fixtures to expect in a level */
export type LevelFixture = Enemy | Portal | NonPlayer | Entry | Item;

export const isLevelFixture = (
  fixture: Enemy | Portal | NonPlayer | Entry | Item | null
): fixture is LevelFixture => fixture !== null;
