import { expect } from "chai";
import Sut from "../../src/ts/Stats";

describe("StatManager", () => {
  it("stat accessors (hp, atk, def, sp_atk, sp_def, spd)", () => {
    let sut = getSut();

    expect(sut.hp).to.equal(10);
    expect(sut.atk).to.equal(5);
    expect(sut.def).to.equal(6);
    expect(sut.sp_atk).to.equal(7);
    expect(sut.sp_def).to.equal(8);
    expect(sut.spd).to.equal(5);
  });

  it("givesExp", () => {
    expect(getSut().givesExp).to.equal(41);
  });

  it("endure", () => {
    let sut = getSut();
    expect(sut.hp).to.equal(10);
    sut.endure(1);
    expect(sut.hp).to.equal(9);
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
