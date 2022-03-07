import Item from "@/item/Item";
import StateManager from "@/state/StateManager";
import menus from "@/menu/menus";
import sinon from "sinon";
import { Inventory } from "@/menu/Inventory";
import { SubMenu } from "@/menu/SubMenu";
import { cloneByStringify } from "@/util";
import { expect } from "chai";

const state = StateManager.getInstance();

afterEach(() => {
  sinon.restore();
  state.empty();
});

describe("Inventory", () => {
  describe("get state", () => {
    it("gets the current state of the inventory", () => {
      let sut = getSut();
      let expected = getEmptyState();

      expect(sut.state).to.deep.equal(expected);
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

      sinon.stub(sword, "ref").value(itemType);
      sinon.stub(sword, "category").value(itemCategory);

      sut.store(sword);

      expect(sut.state).to.deep.equal(expected);
    });
  });

  describe("resolveState", () => {
    it("resolves data from the state manager", () => {
      let inventoryState = getEmptyState();
      inventoryState.menu.item.push("water");

      state.mergeByRef("inventory", inventoryState);

      let sut = getSut();

      let expected = cloneByStringify(inventoryState);

      expect(sut.state).to.deep.equal(expected);
    });
  });
});

const getSut = () => {
  let menu = cloneByStringify(menus.inventory());
  return new Inventory(new SubMenu(menu as any));
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
