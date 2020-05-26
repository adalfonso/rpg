import Actor from "@/actors/Actor";
import Enemy from "@/actors/Enemy";
import Sut from "@/combat/Team";
import sinon from "sinon";
import { expect } from "chai";

describe("Team", () => {
  describe("areDefeated", () => {
    it("detects when the team is defeated", () => {
      const actor1 = getActor();
      const actor2 = getActor();

      sinon.stub(actor1, "stats").get(() => {
        return {
          hp: 0,
        };
      });

      sinon.stub(actor2, "stats").get(() => {
        return {
          hp: 0,
        };
      });

      const sut = new Sut([actor1, actor2]);

      expect(sut.areDefeated).to.be.true;
    });

    it("detects when the team is not yet defeated", () => {
      const sut = new Sut([getActor(), getActor()]);

      expect(sut.areDefeated).to.be.false;
    });
  });

  describe("leader", () => {
    it("gets the team leader", () => {
      const actor1 = getActor();
      const actor2 = getActor();

      const sut = new Sut([actor1, actor2]);

      expect(sut.leader).to.equal(actor1);
    });
  });

  describe("length", () => {
    it("gets the team length", () => {
      const sut = new Sut([getActor(), getActor()]);

      expect(sut.length).to.equal(2);
    });
  });

  describe("each", () => {
    it("applies something to each member", () => {
      const sut = new Sut([getActor(), getActor()]);
      let timesCalled = 0;

      sut.each((actor: Actor) => {
        timesCalled++;
      });

      expect(timesCalled).to.equal(2);
    });
  });

  describe("all", () => {
    it("returns all members", () => {
      const actors = [getActor(), getActor()];
      const sut = new Sut(actors);

      expect(sut.all()).to.equal(actors);
    });
  });

  describe("givesExp", () => {
    it("calculates exp yielded from a team", () => {
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

      const sut = new Sut([actor1, actor2]);

      expect(sut.givesExp).to.equal(25);
    });
  });
});

const getActor = () => {
  return new Enemy({ name: "test", type: "knight" });
};
