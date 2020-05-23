import Item from "@/item/Item";
import StateManager from "@/state/StateManager";
import Sut from "@/menu/Inventory";
import sinon from "sinon";
import { cloneByStringify } from "@/util";
import { expect } from "chai";
import { menus } from "@/config";

const state = StateManager.getInstance();

afterEach(() => {
  sinon.restore();
  state.merge({});
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

      sinon.stub(sword, "type").value(itemType);
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
  let menu = cloneByStringify(menus.inventory);
  return new Sut(menu);
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
