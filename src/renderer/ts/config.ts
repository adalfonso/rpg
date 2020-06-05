export default {
  debug: false,
  scale: 2,
};

export const menus = {
  startMenu: [
    {
      type: "start",
      displayAs: "Start Game!",
      action: (menu: any) => {
        menu.close();
      },
    },
    {
      type: "save",
      displayAs: "Save Game",
      action: (menu: any) => {
        menu.saveState();
      },
    },
  ],
  inventory: [
    {
      type: "item",
      displayAs: "Items",
      menu: [] as any[],
    },
    {
      type: "weapon",
      displayAs: "Weapons",
      equipable: true,
      menu: [] as any[],
    },
    {
      type: "armor",
      displayAs: "Armor",
      equipable: true,
      menu: [] as any[],
    },
    {
      type: "special",
      displayAs: "Special",
      menu: [] as any[],
    },
  ],
};
