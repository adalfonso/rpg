import Sut from "@/combat/Spell";
import { bus } from "@/EventBus";
import { expect } from "chai";

describe("Spell", () => {
  it("gets damage", () => {
    let sut = getSut();

    expect(sut.damage).to.equal(50);
  });

  it("gets displayAs", () => {
    let sut = getSut();

    expect(sut.displayAs).to.equal("Standard Spell");
  });
});

const getSut = () => {
  let spellData = {
    displayAs: "Standard Spell",
    description: "A standard spell.",
    value: 50,
    special: true,
  };

  return new Sut(spellData);
};
