import Player from "@/actor/Player";
import Sut, { Collision } from "@/physics/CollisionHandler";
import { Vector } from "excalibur";
import { AnimationFactory } from "@/ui/animation/AnimationFactory";
import { HeroTeam } from "@/combat/HeroTeam";
import { Item } from "@/inanimate/Item";
import { getEnemy } from "../actor/_fixtures";
import { state } from "@/state/StateManager";

afterEach(() => {
  state().empty();
});

describe("CollisionHandler", () => {
  describe("update", () => {
    it("detects collision with a defeated enemy", () => {
      // TODO: stub hero team
      let sut = new Sut(new HeroTeam([getPlayer()]));

      let enemy = getEnemy();

      sut.loadFixtures([enemy]);

      expect(sut.update(0).length).toBe(0);

      enemy.kill();

      expect(sut.update(0).length).toBe(1);
    });

    it("detects collision with an item", () => {
      let player = getPlayer();

      // TODO: stub hero team
      let sut = new Sut(new HeroTeam([player]));

      let item = new Item(
        new Vector(1, 1),
        Vector.Zero,
        {
          name: "empanada",
          class: "empanada",
          x: 1,
          y: 1,
          height: 1,
          width: 1,
        },
        getConfigCtor,
        getAnimationFactory
      );

      sut.loadFixtures([item]);

      jest.spyOn(player, "collidesWith").mockReturnValue(false);
      expect(sut.update(0).length).toBe(0);

      jest.spyOn(player, "collidesWith").mockReturnValue(getCollision());
      expect(sut.update(0).length).toBe(1);
    });
  });
});

const getPlayer = () => {
  return new Player(Vector.Zero, Vector.Zero, {
    x: 1,
    y: 1,
    height: 1,
    width: 1,
    name: "_default_actor",
    class: "_default_actor",
  });
};

const getCollision = (): Collision => {
  return {
    position: Vector.Zero,
    size: Vector.Zero,
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
