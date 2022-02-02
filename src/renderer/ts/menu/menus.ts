import Actor from "@/actor/Actor";
import Battle from "@/combat/Battle";
import StartMenu, { StartMenuItem } from "./StartMenu";
import StatModifierFactory from "@/combat/strategy/StatModifierFactory";
import { BattleMenuItem } from "./BattleMenu";
import { InventoryMenuItem } from "./Inventory";

export interface BaseMenuItem<M> {
  type: string;
  displayAs: string;
  menu?: (BaseMenuItem<M> | M)[];
}

/** All menus in the game */
export const menus = {
  start: (): StartMenuItem[] => [
    {
      type: "start",
      displayAs: "Start Game!",
      action: (menu: StartMenu) => {
        menu.close();
      },
    },
    {
      type: "save",
      displayAs: "Save Game",
      action: (menu: StartMenu) => {
        menu.saveState();
      },
    },
  ],
  inventory: (): InventoryMenuItem[] => [
    {
      type: "item",
      displayAs: "Items",
      menu: [],
    },
    {
      type: "weapon",
      displayAs: "Weapons",
      equipable: true,
      menu: [],
    },
    {
      type: "armor",
      displayAs: "Armor",
      equipable: true,
      menu: [],
    },
    {
      type: "special",
      displayAs: "Special",
      menu: [],
    },
  ],
  battle: (battle: Battle, getUser: () => Actor): BattleMenuItem[] => [
    {
      type: "Items",
      displayAs: "Items",
      menu: [],
    },
    {
      type: "Attack",
      displayAs: "Attack",
      menu: getUser().weapon ? [getUser().weapon] : [],
    },
    {
      type: "Abilities",
      displayAs: "Abilities",
      menu: getUser().abilities,
    },
    {
      type: "Other",
      displayAs: "Other",
      menu: [
        new StatModifierFactory().createModifier("defend"),
        {
          type: "run_away", // TODO: eslint artifact - unused
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
