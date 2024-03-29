import { Vector } from "excalibur";
import { BaseMovable, Movable } from "@/actor/Entity";

class MovableImpl extends Movable(BaseMovable) {
  constructor(readonly pos: Vector) {
    super();
  }
}

describe("Entity", () => {
  describe("Movable", () => {
    describe("moveTo", () => {
      it("moves the entity to a new location", () => {
        const movable = new MovableImpl(new Vector(1, 1));

        expect(movable.position).toEqual(new Vector(1, 1));
        movable.moveTo(new Vector(1, 2));
        expect(movable.position).toEqual(new Vector(1, 2));
      });
    });
  });
});
