import Sut from "@/item/Item";
import UnownedItem from "@/inanimates/Item";
import Vector from "@common/Vector";
import { expect } from "chai";

describe("Item", () => {
  describe("get displayAs", () => {
    it("gets the dialogue name of the item", () => {
      let sut = getSut();
      let expected = "Big Sword";

      expect(sut.displayAs).to.equal(expected);
    });
  });
});

const getSut = () => {
  let itemType = "big_sword";
  let item = getUnownedItem();

  return new Sut(itemType);
};

const getUnownedItem = (data = { name: "item_123", type: "big_sword" }) => {
  return new UnownedItem(new Vector(0, 0), new Vector(0, 0), data);
};
