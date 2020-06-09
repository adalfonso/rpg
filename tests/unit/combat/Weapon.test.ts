import Damage from "@/combat/Damage";
import Renderable from "@/ui/Renderable";
import Sut from "@/combat/strategy/Weapon";
import { expect } from "chai";

describe("Weapon", () => {
  describe("equip", () => {
    it("equips a weapon", () => {
      const sut = getSut();

      expect(sut.isEquipped).to.be.false;

      sut.equip();

      expect(sut.isEquipped).to.be.true;
    });
  });

  describe("unequip", () => {
    it("unequips a weapon", () => {
      const sut = getSut();

      sut.equip();
      expect(sut.isEquipped).to.be.true;

      sut.unequip();
      expect(sut.isEquipped).to.be.false;
    });
  });
});

const getSut = () => {
  const itemType = "big_sword";

  const template = {
    description: "desc",
    displayAs: "display name",
    category: "weapon",
    ui: { sprite: "weapon.big_sword" },
    value: 1,
  };

  const renderable = new Renderable("test");
  const damage = new Damage(0, "physical");

  return new Sut(template, renderable, damage, itemType);
};
