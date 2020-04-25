import { expect } from "chai";
import Sut from "@/StatManager";

describe("StatManager", () => {
  describe("getters", () => {
    it("accesses stats (hp, atk, def, sp_atk, sp_def, spd)", () => {
      let sut = getSut();

      expect(sut.hp).to.equal(10);
      expect(sut.atk).to.equal(5);
      expect(sut.def).to.equal(6);
      expect(sut.sp_atk).to.equal(7);
      expect(sut.sp_def).to.equal(8);
      expect(sut.spd).to.equal(5);
    });
  });
  describe("givesExp", () => {
    it("gets the experience yield from stat holder", () => {
      expect(getSut().givesExp).to.equal(41);
    });
  });

  describe("endure", () => {
    it("reflects damage dealt in the hp stat", () => {
      let sut = getSut();
      expect(sut.hp).to.equal(10);
      sut.endure(1);
      expect(sut.hp).to.equal(9);
    });
  });
});

const getSut = () => {
  return new Sut(getStats());
};

const getStats = () => {
  return {
    hp: 10,
    atk: 5,
    def: 6,
    sp_atk: 7,
    sp_def: 8,
    spd: 5,
  };
};
