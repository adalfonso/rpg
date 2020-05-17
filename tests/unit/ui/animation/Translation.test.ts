import Sut from "@/ui/animation/Translation";
import Vector from "@common/Vector";
import { expect } from "chai";

describe("Translation", () => {
  describe("update", () => {
    it("updates the position of the translation", () => {
      const start = new Vector(0, 0);
      const end = new Vector(100, 100);
      const duration = 100;

      let sut = new Sut(start, end, duration);

      for (let i = 1; i <= 11; i++) {
        let position = sut.update(10);

        if (i < 11) {
          expect(position).to.deep.equal(new Vector(10 * i, 10 * i));
          expect(sut.isDone).to.be.false;
        }
      }
      expect(sut.isDone).to.be.true;
    });

    it("updates the position of the translation when using negative numbers", () => {
      const start = new Vector(0, -100);
      const end = new Vector(-100, -200);
      const duration = 100;

      let sut = new Sut(start, end, duration);

      let position = sut.update(50);

      expect(position).to.deep.equal(new Vector(-50, -150));
    });
  });
});
