import Player from "@/actor/Player";
import Vector from "@common/Vector";
import sinon from "sinon";
import { HeroTeam } from "@/combat/HeroTeam";
import { expect } from "chai";

describe("HeroTeam", () => {
  describe("gainExp", () => {
    it("distributes exp to team members", () => {
      const actor1 = getActor();
      const actor2 = getActor();

      let actor1Exp = 0;
      let actor2Exp = 0;

      sinon.stub(actor1, "gainExp").callsFake((exp) => {
        actor1Exp = exp;
      });

      sinon.stub(actor2, "gainExp").callsFake((exp) => {
        actor2Exp = exp;
      });

      const sut = new HeroTeam([actor1, actor2]);

      sut.gainExp(20);

      expect(actor1Exp).to.equal(10);
      expect(actor2Exp).to.equal(10);
    });

    it("distributes exp to team members when number is not perfectly divisible ", () => {
      const actor1 = getActor();
      const actor2 = getActor();
      const actor3 = getActor();

      let actor1Exp = 0;
      let actor2Exp = 0;
      let actor3Exp = 0;

      sinon.stub(actor1, "gainExp").callsFake((exp) => {
        actor1Exp = exp;
      });

      sinon.stub(actor2, "gainExp").callsFake((exp) => {
        actor2Exp = exp;
      });

      sinon.stub(actor3, "gainExp").callsFake((exp) => {
        actor3Exp = exp;
      });

      const sut = new HeroTeam([actor1, actor2, actor3]);

      sut.gainExp(20);

      expect(actor1Exp).to.equal(7);
      expect(actor2Exp).to.equal(7);
      expect(actor3Exp).to.equal(7);
    });
  });

  describe("givesExp", () => {
    it("calculates exp yielded by a team", () => {
      const actor1 = getActor();
      const actor2 = getActor();

      sinon.stub(actor1, "stats").get(() => {
        return {
          givesExp: 10,
        };
      });

      sinon.stub(actor2, "stats").get(() => {
        return {
          givesExp: 15,
        };
      });

      const sut = new HeroTeam([actor1, actor2]);

      expect(sut.givesExp).to.equal(25);
    });
  });
});

const getActor = () => {
  return new Player(Vector.empty(), Vector.empty(), {
    x: 1,
    y: 1,
    height: 1,
    width: 1,
    name: "Me",
    type: "player",
  });
};
