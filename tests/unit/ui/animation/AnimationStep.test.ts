import Vector from "@/physics/math/Vector";
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

      expect(sut.update(500).toArray()).toEqual([0.5, 0.5]);
      expect(sut.update(250).toArray()).toEqual([0.25, 0.25]);
      expect(sut.update(500).toArray()).toEqual([0.25, 0.25]);
      expect(sut.update(500).toArray()).toEqual([0.0, 0.0]);
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

      expect(sut.update(1).toArray()).toEqual([1, 1]);
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

      expect(sut.update(100).toArray()).toEqual([0, 0]);
      expect(sut.update(500).toArray()).toEqual([0, 0]);
      expect(sut.update(400).toArray()).toEqual([0, 0]);
      expect(sut.update(1000).toArray()).toEqual([0.25, 0.25]);
      expect(sut.update(2000).toArray()).toEqual([0.5, 0.5]);
      expect(sut.isDone).toBe(false);
      expect(sut.update(1000).toArray()).toEqual([0.25, 0.25]);
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
  (<unknown>((percent: number) => new Vector(1, 1).times(percent)))
);

const getReferences = () => ({
  resolution: Vector.empty(),
  subject: Vector.empty(),
});
