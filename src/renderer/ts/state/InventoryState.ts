/** How the inventory menu is stored in the state */
export interface InventoryState {
  menu: {
    item: string[];
    weapon: string[];
    armor: string[];
    special: string[];
  };
}

/**
 * Determine if an inventory submenu was stored properly in the state
 * @param menu - menu to check
 *
 * @returns if it is a valid menu
 */
const isInventoryStateMenu = (menu: unknown): menu is string[] =>
  !Array.isArray(menu) ||
  menu.filter((label: unknown) => typeof label !== "string").length > 0;

/**
 * Determine if the inventory was stored in the state properly
 *
 * @param data - data read from the state
 *
 * @returns if the inventory menu is valid
 */
export const isInventoryState = (data: unknown): data is InventoryState =>
  typeof data === "object" &&
  data !== null &&
  typeof data["menu"] === "object" &&
  ["item", "weapon", "armor", "special"].filter((category) =>
    isInventoryStateMenu(data["menu"][category])
  ).length === 0;
