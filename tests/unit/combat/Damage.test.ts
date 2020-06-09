import Stats from "@/Stats";
import Sut from "@/combat/Damage";
import sinon from "sinon";
import { expect } from "chai";

describe("Damage", () => {
  describe("isSpecial", () => {
    it("detects when the weapon deals special damage", () => {
      const sut = new Sut(10, "special");

      expect(sut.isSpecial).to.be.true;
    });

    it("detects when the weapon deals physical damage", () => {
      const sut = new Sut(10, "physical");

      expect(sut.isSpecial).to.be.false;
    });
  });

  describe("value", () => {
    it("gets the value of the damage", () => {
      const sut = new Sut(10, "special");

      expect(sut.value).to.equal(10);
    });
  });

  describe("augment", () => {
    it("augments physical damage", () => {
      const stats = getStats();
      sinon.stub(stats, "atk").get(() => 33);

      const sut = new Sut(10, "physical");
      const augmented = sut.augment(stats);

      expect(augmented.value).to.equal(43);
    });

    it("augments special damage", () => {
      const stats = getStats();
      sinon.stub(stats, "sp_atk").get(() => 21);

      const sut = new Sut(10, "special");
      const augmented = sut.augment(stats);

      expect(augmented.value).to.equal(31);
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
