import Sut from "@/actor/Player";
import Vector from "@common/Vector";
import { bus } from "@/EventBus";
import { expect } from "chai";

describe("Player", () => {
  describe("moveTo", () => {
    it("moves the player to a new location", () => {
      let sut = getSut();

      expect(sut.position).to.deep.equal({ x: 0, y: 0 });
      sut.moveTo(new Vector(1, 2));
      expect(sut.position).to.deep.equal({ x: 1, y: 2 });

      bus.unregister(sut);
    });
  });
});

const getSut = () => {
  return new Sut(new Vector(0, 0), new Vector(10, 10));
};
