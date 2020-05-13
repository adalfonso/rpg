import Enemy from "@/actors/Enemy";
import Item from "@/inanimates/Item";
import Player from "@/actors/Player";
import Sut from "@/CollisionHandler";
import Vector from "@common/Vector";
import sinon from "sinon";
import { expect } from "chai";

describe("CollisionHandler", () => {
  describe("update", () => {
    it("detects collision with a defeated enemy", () => {
      let sut = new Sut(getPlayer());

      let enemy = new Enemy({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        name: "knight",
        type: "knight",
      });

      sut.loadFixtures([enemy]);

      expect(sut.update(0).length).to.equal(0);

      enemy.defeated = true;

      expect(sut.update(0).length).to.equal(1);
    });

    it("detects collision with an item", () => {
      let player = getPlayer();
      let sut = new Sut(player);

      let item = new Item(new Vector(1, 1), new Vector(0, 0), {
        name: "empanada",
        type: "empanada",
      });

      sut.loadFixtures([item]);

      sinon.stub(player, "collidesWith").returns(false);
      expect(sut.update(0).length).to.equal(0);

      sinon.restore();

      sinon.stub(player, "collidesWith").returns(true);
      expect(sut.update(0).length).to.equal(1);
    });
  });
});

const getPlayer = () => {
  return new Player(new Vector(0, 0), new Vector(0, 0));
};
