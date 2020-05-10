import Sut from "@/combat/Weapon";
import { expect } from "chai";

describe("Weapon", () => {
  describe("equip", () => {
    it("equips an item", () => {
      let sut = getSut();

      expect(sut.isEquipped).to.be.false;

      sut.equip();

      expect(sut.isEquipped).to.be.true;
    });
  });
});

const getSut = () => {
  let itemType = "big_sword";

  return new Sut(itemType);
};
