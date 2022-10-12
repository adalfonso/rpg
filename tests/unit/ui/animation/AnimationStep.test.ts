import { Vector } from "excalibur";
import { AnimationFunctionApplication } from "@/ui/animation/AnimationFunction";
import { AnimationStep as Sut } from "@/ui/animation/AnimationStep";

describe("AnimationStep", () => {
  describe("update", () => {
    it("updates a step", () => {
      const sut = new Sut(
        {
          delay_ms: 0,
          duration_ms: 1000,
          end: getVector,
          fn: getAnimationFn,
        },
        getReferences()
      );

      const update_1 = sut.update(500);
      expect([update_1.x, update_1.y]).toEqual([0.5, 0.5]);

      const update_2 = sut.update(250);
      expect([update_2.x, update_2.y]).toEqual([0.25, 0.25]);

      const update_3 = sut.update(500);
      expect([update_3.x, update_3.y]).toEqual([0.25, 0.25]);

      const update_4 = sut.update(500);
      expect([update_4.x, update_4.y]).toEqual([0.0, 0.0]);
    });

    it("handles 0-time animation", () => {
      const sut = new Sut(
        {
          delay_ms: 0,
          duration_ms: 0,
          end: getVector,
          fn: getAnimationFn,
        },
        getReferences()
      );

      const { x, y } = sut.update(1);
      expect([x, y]).toEqual([1, 1]);
    });

    it("defers after a delay", () => {
      const sut = new Sut(
        {
          delay_ms: 1000,
          duration_ms: 4000,
          end: getVector,
          fn: getAnimationFn,
        },
        getReferences()
      );

      const update_1 = sut.update(100);
      expect([update_1.x, update_1.y]).toEqual([0, 0]);

      const update_2 = sut.update(500);
      expect([update_2.x, update_2.y]).toEqual([0, 0]);

      const update_3 = sut.update(400);
      expect([update_3.x, update_3.y]).toEqual([0, 0]);

      const update_4 = sut.update(1000);
      expect([update_4.x, update_4.y]).toEqual([0.25, 0.25]);

      const update_5 = sut.update(2000);
      expect([update_5.x, update_5.y]).toEqual([0.5, 0.5]);

      expect(sut.isDone).toBe(false);

      const update_6 = sut.update(1000);
      expect([update_6.x, update_6.y]).toEqual([0.25, 0.25]);

      expect(sut.isDone).toBe(true);
    });
  });

  describe("isDone", () => {
    it("detects a completed step", () => {
      const sut = new Sut(
        {
          delay_ms: 0,
          duration_ms: 4000,
          end: getVector,
          fn: getAnimationFn,
        },
        getReferences()
      );

      sut.update(100);
      expect(sut.isDone).toBe(false);
      sut.update(3899);
      expect(sut.isDone).toBe(false);
      sut.update(1);
      expect(sut.isDone).toBe(true);
    });
  });
});

const getVector = () => <Vector>(<unknown>{
    copy: () => getVector(),
    times: () => [1, 1],
  });

const getAnimationFn = <AnimationFunctionApplication>(
  (<unknown>((percent: number) => new Vector(1, 1).scale(percent)))
);

const getReferences = () => ({
  resolution: Vector.Zero,
  subject: Vector.Zero,
});
