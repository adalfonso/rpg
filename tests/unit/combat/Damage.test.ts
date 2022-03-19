import Stats from "@/actor/Stats";
import Sut from "@/combat/Damage";

describe("Damage", () => {
  describe("isSpecial", () => {
    it("detects when the weapon deals special damage", () => {
      const sut = new Sut(10, "special");

      expect(sut.isSpecial).toBe(true);
    });

    it("detects when the weapon deals physical damage", () => {
      const sut = new Sut(10, "physical");

      expect(sut.isSpecial).toBe(false);
    });
  });

  describe("value", () => {
    it("gets the value of the damage", () => {
      const sut = new Sut(10, "special");

      expect(sut.value).toBe(10);
    });
  });

  describe("augment", () => {
    it("augments physical damage", () => {
      const stats = getStats();

      jest.spyOn(stats, "atk", "get").mockReturnValueOnce(33);

      const sut = new Sut(10, "physical");
      const augmented = sut.augment(stats);

      expect(augmented.value).toBe(43);
    });

    it("augments special damage", () => {
      const stats = getStats();
      jest.spyOn(stats, "sp_atk", "get").mockReturnValueOnce(21);

      const sut = new Sut(10, "special");
      const augmented = sut.augment(stats);

      expect(augmented.value).toBe(31);
    });
  });
});

const getStats = () => {
  return new Stats({
    hp: 0,
    atk: 1,
    def: 0,
    sp_atk: 0,
    sp_def: 0,
    spd: 0,
  });
};
