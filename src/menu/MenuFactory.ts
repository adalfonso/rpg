import MissingDataError from "@/error/MissingDataError";
import menus, { MenuItemTemplate, MenuTemplate } from "./menus";
import { EquipperFactory } from "@/combat/EquipperFactory";
import { Inventory } from "./Inventory";
import { MenuItem } from "./MenuItem";
import { MenuType } from "./types";
import { StartMenu } from "./StartMenu";
import { SubMenu } from "./SubMenu";
import { manifest } from "./ui/manifest";

/**
 * SubMenu Factory
 *
 * @param menu_type - type of the overall (parent) menu
 * @param template - menu template
 *
 * @returns SubMenu
 */
export const createSubMenu =
  <T>(menu_type: MenuType) =>
  (template: MenuTemplate<T>) => {
    const renderer = manifest[menu_type];

    if (!renderer) {
      throw new MissingDataError(
        `Could not find menu renderer when creating a SubMenu of type "${menu_type}"`
      );
    }

    return new SubMenu(template, menu_type, renderer.menu);
  };

/**
 * MenuItem Factory
 *
 * @param menu_type - type of the overall (parent) menu
 * @param template - menu template
 *
 * @returns MenuItem
 */
export const createMenuItem =
  <T>(menu_type: MenuType) =>
  (template: MenuItemTemplate<T>) => {
    const renderer = manifest[menu_type];

    if (!renderer) {
      throw new MissingDataError(
        `Could not find menu item renderer when creating a SubMenu of type "${menu_type}"`
      );
    }

    return new MenuItem(template, menu_type, renderer.item);
  };

export interface MenuList {
  start: StartMenu;
  inventory: Inventory;
}

/**
 * Create the common menus used in the game
 *
 * @param equipper - factory to establish how the inventory can equip weapons
 * @returns menus
 */
export const createMenus = (equipper: EquipperFactory): MenuList => ({
  start: new StartMenu(createSubMenu(MenuType.Start)(menus.start())),
  inventory: new Inventory(
    createSubMenu(MenuType.Inventory)(menus.inventory()),
    equipper
  ),
});
