export default {
  debug: false,
  scale: 2,
};

export const menus = {
  startMenu: [
    {
      type: "start",
      description: "Press Enter to Start!",
      action: (menu) => {
        menu.close();
      },
    },
    {
      type: "load",
      description: "Load Saved State (doesn't work yet)",
      action: (menu) => {},
    },
  ],
  inventory: [
    {
      type: "item",
      description: "Items",
      menu: [],
    },
    {
      type: "equipable",
      description: "Equipment",
      menu: [],
    },
    {
      type: "special",
      description: "Special",
      menu: [],
    },
  ],
};

export const weapons = [
  {
    name: "Basic Sword",
    description: "A basic bish sword.",
    damage: 3,
  },
  {
    name: "Mace",
    description: "An effing mace. Watch out!",
    damage: 10,
  },
  {
    name: "Pole Arm",
    description: "Swift and strong.",
    damage: 5,
  },
];
