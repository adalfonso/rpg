import Actor from "@/actor/Actor";
import Battle from "@/combat/Battle";
import StartMenu, { StartMenuItem } from "./StartMenu";
import StatModifierFactory from "@/combat/strategy/StatModifierFactory";
import { BattleMenuItem } from "./BattleMenu";
import { InventoryMenuItem } from "./Inventory";

export interface BaseMenuItem<M> {
  ref: string;
  displayAs: string;
  menu?: (BaseMenuItem<M> | M)[];
}

/** All menus in the game */
export const menus = {
  start: (): StartMenuItem[] => [
    {
      ref: "start",
      displayAs: "Start Game!",
      action: (menu: StartMenu) => {
        menu.close();
      },
    },
    {
      ref: "save",
      displayAs: "Save Game",
      action: (menu: StartMenu) => {
        menu.saveState();
      },
    },
  ],
  inventory: (): InventoryMenuItem[] => [
    {
      ref: "item",
      displayAs: "Items",
      menu: [],
    },
    {
      ref: "weapon",
      displayAs: "Weapons",
      equipable: true,
      menu: [],
    },
    {
      ref: "armor",
      displayAs: "Armor",
      equipable: true,
      menu: [],
    },
    {
      ref: "special",
      displayAs: "Special",
      menu: [],
    },
  ],
  battle: (battle: Battle, getUser: () => Actor): BattleMenuItem[] => [
    {
      ref: "item",
      displayAs: "Items",
      menu: [],
    },
    {
      ref: "attack",
      displayAs: "Attack",
      // TODO: need a menu refactor before this works for multiple players
      menu: getUser().weapon ? [getUser().weapon] : [],
    },
    {
      ref: "ability",
      displayAs: "Abilities",
      menu: getUser().abilities,
    },
    {
      ref: "other",
      displayAs: "Other",
      menu: [
        new StatModifierFactory().createModifier("defend"),
        {
          ref: "run_away",
          displayAs: "Run Away",
          use: () => {
            battle.stop();
          },
        },
      ],
    },
  ],
};

export default menus;
