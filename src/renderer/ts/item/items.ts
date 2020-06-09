import { ItemList } from "./types";

/**
 * All items contained in the game
 */
const items: ItemList = {
  empanada: {
    description: "A tasty treat! Restore 50 HP.",
    displayAs: "Empanada",
    category: "item",
    ui: {
      sprite: "item.empanada",
      scale: 2,
    },
    value: 0.25,
  },
  water: {
    description: "For the thirsty. Restores 10 hp.",
    displayAs: "Water hey",
    category: "item",
    ui: {
      sprite: "item.water_bottle",
    },
    value: 0.5,
  },
  big_sword: {
    description: "A big ass word that has clearly seen better days.",
    displayAs: "Big Sword",
    category: "weapon",
    ui: {
      sprite: "weapon.big_sword",
    },
    value: 15,
  },
  empanada_weapon: {
    description: "It is a sharp disc that kills people that are in its way.",
    displayAs: "Empanada",
    category: "weapon",
    ui: {
      sprite: "item.empanada",
      scale: 2,
    },
    value: 50,
  },
  unarmed: {
    displayAs: "Unarmed",
    description: "Unarmed.",
    category: "weapon",
    value: 1,
    ui: { sprite: "missing" },
  },
};

export default items;
