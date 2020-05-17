import Sut from "@/combat/Weapon";
import { expect } from "chai";

describe("Weapon", () => {
  describe("equip", () => {
    it("equips a weapon", () => {
      let sut = getSut();

      expect(sut.isEquipped).to.be.false;

      sut.equip();

      expect(sut.isEquipped).to.be.true;
    });
  });

  describe("unequip", () => {
    it("unequips a weapon", () => {
      let sut = getSut();

      sut.equip();
      expect(sut.isEquipped).to.be.true;

      sut.unequip();
      expect(sut.isEquipped).to.be.false;
    });
  });
});

const getSut = () => {
  let itemType = "big_sword";

  return new Sut(itemType);
};
