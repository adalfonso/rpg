import Vector from "@/physics/math/Vector";
import { Menu } from "../Menu";
import { MenuItem } from "../MenuItem";
import { SubMenu } from "../SubMenu";
import {
  MenuRenderConfig,
  MenuRenderFontConfig,
  MenuRenderLogic,
  MenuStyleRenderConfig,
  PartialMenuRenderConfig,
} from "./types";

const default_font: MenuRenderFontConfig = {
  background_color: "transparent",
  border_color: "transparent",
  color: "#333",
  shadow_color: "#000",
  shadow_offset: new Vector(2, 2),
  shadow_blur: 0,
  highlight_color: "#0AA",
  size: 24,
  subtext_size: 16,
  family: "Minecraftia",
  align: "left",
};

const default_menu: MenuStyleRenderConfig = {
  background_color: "transparent",
  sub_menu_width: 0,
};

const getDefaultLogic = <T>(menu: Menu<T>): MenuRenderLogic<T> => {
  return {
    default_menu: menu.submenu,
    isMainMenu: (m: SubMenu<T>) => m === menu.submenu,
    isCurrentOption: (item: MenuItem<T>) =>
      item === menu.currentOption || item.source === menu.currentOption.source,
    isSelected: (_item: MenuItem<T>) => false,
    getBadgeTitle: (_menu: MenuItem<T>) => "",
  };
};

/**
 * Generate a rendering config for a menu
 *
 * This is versatile in that it can be used for the original generation, or it
 * can provide a config to use as a base and augment it. The latter option is
 * used when change the config between nested menus and items.
 *
 * @param config partial config
 * @param menu_or_default a base menu or default config to augment
 *
 * @returns render config
 */
export const createConfig = <T>(
  config: Partial<PartialMenuRenderConfig<T>>,
  menu_or_default: Menu<T> | MenuRenderConfig<T>
): MenuRenderConfig<T> => {
  // Brand new config that uses defaults
  if (menu_or_default instanceof Menu) {
    return {
      font: { ...default_font, ...(config.font ?? {}) },
      menu: {
        ...default_menu,
        ...(config.menu ?? {}),
      },
      logic: {
        ...getDefaultLogic(menu_or_default),
        ...(config.logic ?? {}),
      },
    };
  }

  // Config the augments and existing config
  return {
    font: { ...menu_or_default.font, ...(config.font ?? {}) },
    menu: { ...menu_or_default.menu, ...(config.menu ?? {}) },
    logic: { ...menu_or_default.logic, ...(config.logic ?? {}) },
  };
};
