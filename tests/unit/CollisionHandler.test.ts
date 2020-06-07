import Enemy from "@/actor/Enemy";
import Item from "@/inanimate/Item";
import Player from "@/actor/Player";
import StateManager from "@/state/StateManager";
import Sut, { Collision } from "@/CollisionHandler";
import Vector from "@common/Vector";
import sinon from "sinon";
import { expect } from "chai";

const state = StateManager.getInstance();

afterEach(() => {
  state.empty();
});

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

      enemy.kill();

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

      sinon.stub(player, "collidesWith").returns(getCollision());
      expect(sut.update(0).length).to.equal(1);
    });
  });
});

const getPlayer = () => {
  return new Player(new Vector(0, 0), new Vector(0, 0));
};

const getCollision = (): Collision => {
  return {
    position: new Vector(0, 0),
    size: new Vector(0, 0),
  };
};
