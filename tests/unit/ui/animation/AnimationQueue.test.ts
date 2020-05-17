import AnimatedText from "@/ui/animation/AnimatedText";
import Sut from "@/ui/animation/AnimationQueue";
import Translation from "@/ui/animation/Translation";
import Vector from "@common/Vector";
import sinon from "sinon";
import { expect } from "chai";

describe("AnimationQueue", () => {
  describe("isWaiting", () => {
    it("determines if the queue is waiting", () => {
      let animatedText = new AnimatedText("", {});

      let sut = new Sut(
        [new Translation(new Vector(0, 0), new Vector(0, 0), 1000)],
        animatedText
      );

      sinon.stub(animatedText, "isWaiting").value(true);

      expect(sut.isDone).to.be.false;

      sut.update(1);

      expect(sut.isDone).to.be.true;
    });
  });
});
