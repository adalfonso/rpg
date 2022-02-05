import Vector from "@common/Vector";
import { Empty } from "@/mixins";
import { Movable } from "@/Entity";
import { expect } from "chai";

class MovableImpl extends Movable(Empty) {
  constructor(protected _position: Vector) {
    super();
  }
}

describe("Entity", () => {
  describe("Movable", () => {
    describe("moveTo", () => {
      it("moves the entity to a new location", () => {
        const movable = new MovableImpl(new Vector(1, 1));

        expect(movable.position).to.deep.equal(new Vector(1, 1));
        movable.moveTo(new Vector(1, 2));
        expect(movable.position).to.deep.equal(new Vector(1, 2));
      });
    });
  });
});