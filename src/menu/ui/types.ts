import Vector from "@/physics/math/Vector";
import { Descriptive } from "@/combat/strategy/CombatStrategy";
import { Drawable } from "@/interfaces";
import { MenuItem } from "../MenuItem";
import { SubMenu } from "../SubMenu";

interface MenuRenderFontSettings {
  color: string;
  shadow_color: string;
  highlight_color: string;
  size: number;
  subtext_size: number;
  family: string;
}

interface MenuRenderSettings {
  font: MenuRenderFontSettings;
  background_color: string;
}

interface MenuRenderLogic<T> {
  default_menu: SubMenu<T>;
  sub_menu_width?: number;
  row_offset_y?: number;
  isMainMenu: (menu: SubMenu<T>) => boolean;
  isCurrentOption: (item: MenuItem<T>) => boolean;
  isSelected: (item: MenuItem<T>) => boolean;
  isSubMenuItem: (item: MenuItem<T>) => boolean;
  shouldDrawDetails: (source: unknown) => source is Drawable & Descriptive;
  getBadgeTitle: (item: MenuItem<T>) => string;
}

export type MenuRenderConfig<T> = MenuRenderSettings & MenuRenderLogic<T>;

export type SubMenuRenderer<T> = (
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  resolution: Vector,
  options: MenuRenderConfig<T>,
  menu: SubMenu<T>
) => void;

export type MenuItemRenderer<T> = (
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  resolution: Vector,
  options: MenuRenderConfig<T>,
  item: MenuItem<T>
) => void;
