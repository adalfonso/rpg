import Actor from "@/actor/Actor";
import Damage from "@/combat/Damage";
import Renderable from "@/ui/Renderable";
import Sut from "@/combat/strategy/Weapon";

describe("Weapon", () => {
  describe("equip", () => {
    it("equips a weapon", () => {
      const sut = getSut();

      expect(sut.isEquipped).toBe(false);

      sut.equip({} as Actor);

      expect(sut.isEquipped).toBe(true);
    });
  });

  describe("unequip", () => {
    it("unequips a weapon", () => {
      const sut = getSut();

      sut.equip({} as Actor);
      expect(sut.isEquipped).toBe(true);

      sut.unequip();
      expect(sut.isEquipped).toBe(false);
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
