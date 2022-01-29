import Vector from "@common/Vector";
import { AnimationFactory } from "@/ui/animation/AnimationFactory";
import { Item as Sut } from "@/inanimate/Item";
import { ItemConfig } from "@/item/types";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { expect } from "chai";
import { AnimationType } from "@/ui/animation/Animation";

describe("inanimate/Item", () => {
  describe("update", () => {
    it("remains stationary when no animation", () => {
      const sut = getSut();
      sut.update(100);

      expect(sut.position.toArray()).to.deep.equal([1, 1]);
    });

    it("updates position during animation", () => {
      const animation_factory = () => () => ({
        update: () => ({
          type: AnimationType.Position,
          delta: new Vector(1, 1),
        }),
      });

      const config_ctor = (_: any) =>
        <ItemConfig>{
          description: "foo",
          displayAs: "Foo",
          category: "weapon",
          ui: {
            sprite: "weapon.big_sword",
            animation: "stir",
          },
          value: 15,
        };

      const sut = getSut({ animation_factory, config_ctor });
      sut.update(100);

      expect(sut.position.toArray()).to.deep.equal([2, 2]);
    });
  });
});

const getSut = ({ animation_factory, config_ctor }: any = {}) => {
  return new Sut(
    new Vector(1, 1),
    new Vector(1, 1),
    getTemplate(),
    config_ctor ?? getConfigCtor(),
    animation_factory ?? getAnimationFactory
  );
};

const getTemplate = () =>
  <LevelFixtureTemplate>{
    name: "foo",
    type: "item",
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  };

const getConfigCtor = () => (_: any) =>
  <ItemConfig>{
    description: "foo",
    displayAs: "Foo",
    category: "weapon",
    ui: {
      sprite: "weapon.big_sword",
    },
    value: 15,
  };

const getAnimationFactory = <AnimationFactory>(<unknown>(() => () => {}));