import { expect } from "chai";
import Sut from "@/StatManager";

describe("StatManager", () => {
  describe("getters", () => {
    it("accesses stats (hp, atk, def, sp_atk, sp_def, spd)", () => {
      let sut = getSut();

      expect(sut.hp).to.equal(25);
      expect(sut.atk).to.equal(37);
      expect(sut.def).to.equal(20);
      expect(sut.sp_atk).to.equal(30);
      expect(sut.sp_def).to.equal(10);
      expect(sut.spd).to.equal(17);
    });
  });

  describe("givesExp", () => {
    it("gets the experience yield from stat holder", () => {
      expect(getSut().givesExp).to.equal(140);
    });
  });

  describe("endure", () => {
    it("reflects damage dealt in the hp stat", () => {
      let sut = getSut();
      expect(sut.hp).to.equal(25);
      sut.endure(1);
      expect(sut.hp).to.equal(24);

      sut.endure(24);
      expect(sut.hp).to.equal(20);
    });
  });
});

const getSut = () => {
  let sut = new Sut(getStats());
  sut.lvl = 10;

  return sut;
};

const getStats = () => {
  return {
    hp: 100,
    atk: 150,
    def: 80,
    sp_atk: 120,
    sp_def: 40,
    spd: 70,
  };
};
