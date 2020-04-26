export default {
  debug: false,
  scale: 2,
};

export const menus = {
  startMenu: [
    {
      type: "start",
      description: "Start Game!",
      action: (menu) => {
        menu.close();
      },
    },
    {
      type: "save",
      description: "Save Game",
      action: (menu) => {
        menu.saveState();
      },
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
