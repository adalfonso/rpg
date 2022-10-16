import Battle from "@/combat/Battle";
import StatModifierFactory from "@/combat/strategy/StatModifierFactory";
import { Actor } from "@/actor/Actor";
import { BattleMenuItem } from "./BattleMenu";
import { InventoryMenuItem } from "./Inventory";
import { StartMenu, StartMenuItem } from "./StartMenu";

export interface BaseMenuItemTemplate {
  ref: string;
  displayAs: string;
}

export type MenuItemTemplate<T> = T &
  BaseMenuItemTemplate & {
    menu?: MenuTemplate<T>;
  };

export const isMenuItemTemplate = <T extends Record<string, unknown>>(
  input: T
): input is MenuItemTemplate<T> =>
  typeof input === "object" &&
  typeof input.ref === "string" &&
  typeof input.displayAs === "string";

export type MenuGenerator<T> = () => MenuItemTemplate<T>[];

export type MenuTemplate<T> = MenuItemTemplate<T>[] | MenuGenerator<T>;

/** All menus in the game */
export const menus = {
  start: (): MenuItemTemplate<StartMenuItem>[] => [
    {
      ref: "start",
      displayAs: "Start Game!",
      action: (menu: StartMenu) => menu.close(),
    },
    {
      ref: "save",
      displayAs: "Save Game",
      action: (menu: StartMenu) => menu.saveState(),
    },
  ],

  inventory: (): MenuItemTemplate<InventoryMenuItem>[] => [
    { ref: "item", displayAs: "Items", menu: [] },
    { ref: "weapon", displayAs: "Weapons", equipable: true, menu: [] },
    { ref: "armor", displayAs: "Armor", equipable: true, menu: [] },
    { ref: "special", displayAs: "Special", menu: [] },
  ],

  battle: (
    battle: Battle,
    getUser: () => Actor
  ): MenuItemTemplate<BattleMenuItem>[] => [
    {
      ref: "item",
      displayAs: "Items",
      menu: [],
    },
    {
      ref: "attack",
      displayAs: "Attack",
      menu: () => {
        const weapon = getUser().weapon;
        return weapon ? [weapon] : [];
      },
    },
    {
      ref: "ability",
      displayAs: "Abilities",
      menu: () => getUser().abilities,
    },
    {
      ref: "other",
      displayAs: "Other",
      menu: [
        new StatModifierFactory().createModifier("defend"),
        {
          ref: "run_away",
          displayAs: "Run Away",
          use: () => battle.stop(),
        },
      ],
    },
  ],
};

export default menus;
