import Actor from "@/actor/Actor";
import Enemy from "@/actor/Enemy";
import StateManager from "@/state/StateManager";
import Sut from "@/combat/Team";
import Vector from "@common/Vector";
import sinon from "sinon";
import { expect } from "chai";

const state = StateManager.getInstance();

afterEach(() => {
  state.empty();
});

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

  describe("prepare", () => {
    it("set direction and position of team members", () => {
      const sut = new Sut([getActor()]);

      const position = new Vector(5, 6);
      const direction = 2;

      expect(sut.leader.direction).to.not.equal(2);
      expect(sut.leader.position.x).to.not.equal(5);
      expect(sut.leader.position.y).to.not.equal(6);

      sut.prepare(direction, position);

      expect(sut.leader.direction).to.equal(2);
      expect(sut.leader.position.x).to.equal(5);
      expect(sut.leader.position.y).to.equal(6);
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

  describe("hasLastManStanding", () => {
    it("detects when has last man standing", () => {
      const actor1 = getActor();
      const actor2 = getActor();
      const sut = new Sut([actor1, actor2]);

      expect(sut.hasLastManStanding()).to.be.false;

      actor2.kill();
      expect(sut.hasLastManStanding()).to.be.true;

      actor1.kill();
      expect(sut.hasLastManStanding()).to.be.false;
    });
  });
});

const getActor = () => {
  return new Enemy({ name: "test", type: "knight", width: 1, height: 1 });
};
