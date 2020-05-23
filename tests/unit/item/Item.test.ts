import Sut from "@/item/Item";
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

  return new Sut(itemType);
};
