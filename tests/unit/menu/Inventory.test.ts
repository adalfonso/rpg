import Item from "@/item/Item";
import menus, { MenuTemplate } from "@/menu/menus";
import { EquipperFactory } from "@/combat/EquipperFactory";
import { Inventory, InventoryMenuItem } from "@/menu/Inventory";
import { MenuType } from "@/menu/types";
import { cloneByStringify } from "@/util";
import { createSubMenu } from "@/menu/MenuFactory";
import { state } from "@/state/StateManager";

beforeEach(() => {
  state().empty();
  state().mergeByRef("team", []);
});

describe("Inventory", () => {
  describe("get state", () => {
    it("gets the current state of the inventory", () => {
      let sut = getSut();
      let expected = getEmptyState();

      expect(sut.state).toEqual(expected);
    });
  });

  describe("store", () => {
    it("stores an item in the inventory", () => {
      let sut = getSut();

      let expected = getEmptyState();
      let itemType = "big_sword";
      let itemCategory = "weapon";
      let sword = getItem(itemType);

      expected.menu.weapon.push(itemType);

      jest.spyOn(sword, "ref", "get").mockReturnValue(itemType);
      jest.spyOn(sword, "category", "get").mockReturnValue(itemCategory);

      sut.store(sword);

      expect(sut.state).toEqual(expected);
    });
  });

  describe("resolveState", () => {
    it("resolves data from the state manager", () => {
      let inventoryState = getEmptyState();
      inventoryState.menu.item.push("water");

      state().mergeByRef("inventory", inventoryState);

      let sut = getSut();

      let expected = cloneByStringify(inventoryState);

      expect(sut.state).toEqual(expected);
    });
  });
});

const getSut = () => {
  let menu = cloneByStringify(menus.inventory());
  return new Inventory(
    createSubMenu(MenuType.Inventory)(menu as MenuTemplate<InventoryMenuItem>),
    (() => ({ menu: () => [] })) as unknown as EquipperFactory
  );
};

const getItem = (type: string) => {
  return new Item(type);
};

const getEmptyState = (): any => {
  return {
    menu: {
      item: [],
      weapon: [],
      armor: [],
      special: [],
    },
  };
};
