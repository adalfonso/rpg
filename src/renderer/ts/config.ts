export default {
  debug: false,
  scale: 2,
};

export const menus = {
  startMenu: [
    {
      type: "start",
      displayAs: "Start Game!",
      action: (menu) => {
        menu.close();
      },
    },
    {
      type: "save",
      displayAs: "Save Game",
      action: (menu) => {
        menu.saveState();
      },
    },
  ],
  inventory: [
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
      menu: [],
    },
    {
      type: "special",
      displayAs: "Special",
      menu: [],
    },
  ],
};
