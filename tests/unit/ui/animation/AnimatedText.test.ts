import Sut from "@/ui/animation/AnimatedText";
import Translation from "@/ui/animation/Translation";
import Vector from "@common/Vector";
import sinon from "sinon";
import { expect } from "chai";

describe("AnimatedText", () => {
  describe("isWaiting", () => {
    it("determines if an animation is waiting", () => {
      let sut = new Sut("", {});
      let animation = getAnimation();

      sinon.stub(animation, "isDone").value(true);

      expect(sut.isWaiting).to.be.true;

      sut.applyAnimation(animation);

      expect(sut.isWaiting).to.be.false;

      sut.update(1);

      expect(sut.isWaiting).to.be.true;
    });
  });
});

const getAnimation = () => {
  return new Translation(new Vector(0, 0), new Vector(0, 0), 1000);
};
