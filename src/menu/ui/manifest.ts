import { MenuItemRenderer, SubMenuRenderer } from "./types";
import { MenuType } from "../types";
import { render as battle_item } from "./BattleItemUi";
import { render as battle_menu } from "./BattleUi";
import { render as inventory_item } from "./InventoryItemUi";
import { render as inventory_menu } from "./InventoryUi";
import { render as start_item } from "./StartItemUi";
import { render as start_menu } from "./StartUi";

interface MenuRenderComponents<T> {
  menu: SubMenuRenderer<T>;
  item: MenuItemRenderer<T>;
}

/**
 * The typing situation is a bit complicated here because this manifest serves
 * as a common manifest for all SubMenus and MenuItems. These two classes are
 * generic which makes a universal manifest require some escape from the type
 * system. This can lead to bugs.
 */
export const manifest: Record<MenuType, MenuRenderComponents<any>> = {
  [MenuType.Inventory]: { menu: inventory_menu, item: inventory_item },
  [MenuType.Battle]: { menu: battle_menu, item: battle_item },
  [MenuType.Start]: { menu: start_menu, item: start_item },
};
