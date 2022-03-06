import Enemy from "@/actor/Enemy";
import Player from "@/actor/Player";
import StateManager from "@/state/StateManager";
import Sut, { Collision } from "@/CollisionHandler";
import Vector from "@common/Vector";
import sinon from "sinon";
import { AnimationFactory } from "@/ui/animation/AnimationFactory";
import { HeroTeam } from "@/combat/HeroTeam";
import { Item } from "@/inanimate/Item";
import { expect } from "chai";

const state = StateManager.getInstance();

afterEach(() => {
  state.empty();
});

describe("CollisionHandler", () => {
  describe("update", () => {
    it("detects collision with a defeated enemy", () => {
      // TODO: stub hero team
      let sut = new Sut(new HeroTeam([getPlayer()]));

      let enemy = new Enemy(getVector(), getVector(), {
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

      // TODO: stub hero team
      let sut = new Sut(new HeroTeam([player]));

      let item = new Item(
        new Vector(1, 1),
        Vector.empty(),
        {
          name: "empanada",
          type: "empanada",
          x: 1,
          y: 1,
          height: 1,
          width: 1,
        },
        getConfigCtor,
        getAnimationFactory
      );

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
  return new Player(Vector.empty(), Vector.empty(), {
    x: 1,
    y: 1,
    height: 1,
    width: 1,
    name: "Me",
    type: "player",
  });
};

const getCollision = (): Collision => {
  return {
    position: Vector.empty(),
    size: Vector.empty(),
  };
};

const getVector = () => {
  return <Vector>(<unknown>{
    copy() {
      return getVector();
    },
    times() {
      return getVector();
    },
  });
};

const getConfigCtor = () => <any>(<unknown>{
    type: "foo",
    ui: { sprite: "actor.player" },
  });

const getAnimationFactory = <AnimationFactory>(<unknown>(() => () => {}));
