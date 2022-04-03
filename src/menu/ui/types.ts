import Vector from "@/physics/math/Vector";
import { MenuItem } from "../MenuItem";
import { SubMenu } from "../SubMenu";

/** Menu font render config */
export interface MenuRenderFontConfig {
  color: string;
  background_color: string;
  border_color: string;
  shadow_color: string;
  shadow_offset: Vector;
  shadow_blur: number;
  highlight_color: string;
  size: number;
  subtext_size: number;
  family: string;
  align: "left" | "right" | "center";
}

/** Menu render config */
export interface MenuStyleRenderConfig {
  background_color: string;
  sub_menu_width: number;
  row_offset_y: number;
}

/** Rendering logic used to inform render decisions */
export interface MenuRenderLogic<T> {
  default_menu: SubMenu<T>;

  isMainMenu: (menu: SubMenu<T>) => boolean;
  isCurrentOption: (item: MenuItem<T>) => boolean;
  isSelected: (item: MenuItem<T>) => boolean;
  isSubMenuItem: (item: MenuItem<T>) => boolean;
  getBadgeTitle: (item: MenuItem<T>) => string;
}

/** General menu rendering config */
export interface MenuRenderConfig<T> {
  font: MenuRenderFontConfig;
  menu: MenuStyleRenderConfig;
  logic: MenuRenderLogic<T>;
}

/** Partial rendering config; used to generate a full config */
export interface PartialMenuRenderConfig<T> {
  font: Partial<MenuRenderFontConfig>;
  menu: Partial<MenuStyleRenderConfig>;
  logic: Partial<MenuRenderLogic<T>>;
}

/** Function signature for drawing SubMenu */
export type SubMenuRenderer<T> = (
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  resolution: Vector,
  options: MenuRenderConfig<T>,
  menu: SubMenu<T>
) => void;

/** Function signature for drawing MenuItem */
export type MenuItemRenderer<T> = (
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  resolution: Vector,
  options: MenuRenderConfig<T>,
  item: MenuItem<T>
) => void;
