import { AnimationFactory } from "@/ui/animation/AnimationFactory";
import { AnimationType } from "@/ui/animation/Animation";
import { Item } from "@/inanimate/Item";
import { ItemConfig } from "@/item/types";
import { TiledTemplate } from "@/actor/types";
import { Vector } from "excalibur";

describe("inanimate/Item", () => {
  describe("update", () => {
    it("remains stationary when no animation", () => {
      const item = getItem();
      item.onPostUpdate({} as ex.Engine, 100);

      const { x, y } = item.position;

      expect([x, y]).toEqual([1, 1]);
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

      const item = getItem({ animation_factory, config_ctor });
      item.onPostUpdate({} as ex.Engine, 100);

      const { x, y } = item.position;

      expect([x, y]).toEqual([2, 2]);
    });
  });
});

const getItem = ({ animation_factory, config_ctor }: any = {}) => {
  return new Item(
    getTemplate(),
    config_ctor ?? getConfigCtor(),
    animation_factory ?? getAnimationFactory
  );
};

const getTemplate = () =>
  ({
    name: "foo",
    class: "item",
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  } as TiledTemplate);

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
