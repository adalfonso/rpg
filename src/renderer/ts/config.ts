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
      type: "weapon",
      description: "Weapons",
      menu: [],
    },
    {
      type: "armor",
      description: "Armor",
      menu: [],
    },
    {
      type: "special",
      description: "Special",
      menu: [],
    },
  ],
};
