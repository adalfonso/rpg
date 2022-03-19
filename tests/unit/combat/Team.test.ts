import Actor from "@/actor/Actor";
import Stats from "@/actor/Stats";
import Sut from "@/combat/Team";
import Vector from "@/physics/math/Vector";
import { Direction } from "@/ui/types";
import { getPlayer } from "../actor/_fixtures";
import { state } from "@/state/StateManager";

afterEach(() => {
  state().empty();
});

describe("Team", () => {
  describe("areDefeated", () => {
    it("detects when the team is defeated", () => {
      const actor1 = getPlayer();
      const actor2 = getPlayer();

      jest.spyOn(actor1, "stats", "get").mockReturnValue({ hp: 0 } as Stats);
      jest.spyOn(actor2, "stats", "get").mockReturnValue({ hp: 0 } as Stats);

      const sut = new Sut([actor1, actor2]);

      expect(sut.areDefeated).toBe(true);
    });

    it("detects when the team is not yet defeated", () => {
      const sut = new Sut([getPlayer(), getPlayer()]);

      expect(sut.areDefeated).toBe(false);
    });
  });

  describe("leader", () => {
    it("gets the team leader", () => {
      const actor1 = getPlayer();
      const actor2 = getPlayer();

      const sut = new Sut([actor1, actor2]);

      expect(sut.leader).toBe(actor1);
    });
  });

  describe("length", () => {
    it("gets the team length", () => {
      const sut = new Sut([getPlayer(), getPlayer()]);

      expect(sut.length).toBe(2);
    });
  });

  describe("each", () => {
    it("applies something to each member", () => {
      const sut = new Sut([getPlayer(), getPlayer()]);
      let timesCalled = 0;

      sut.each((_actor: Actor) => {
        timesCalled++;
      });

      expect(timesCalled).toBe(2);
    });
  });

  describe("prepare", () => {
    it("set direction and position of team members", () => {
      const sut = new Sut([getPlayer(), getPlayer({ size: new Vector(1, 1) })]);

      const position = new Vector(5, 6);
      const direction = Direction.East;

      const members = sut.all();
      const leader = sut.leader;

      expect(leader.direction).not.toBe(Direction.East);
      expect(leader.position.x).not.toBe(5);
      expect(leader.position.y).not.toBe(6);

      sut.prepare(direction, position);

      expect(leader.direction).toBe(Direction.East);
      expect(leader.position.x).toBe(5);
      expect(leader.position.y).toBe(6);

      expect(members[1].direction).toBe(Direction.East);
      expect(members[1].position.x).toBe(9);
      expect(members[1].position.y).toBe(6);
    });
  });

  describe("all", () => {
    it("returns all members", () => {
      const actors = [getPlayer(), getPlayer()];
      const sut = new Sut(actors);

      expect(sut.all()).toBe(actors);
    });
  });

  describe("givesExp", () => {
    it("calculates exp yielded from a team", () => {
      const actor1 = getPlayer();
      const actor2 = getPlayer();

      jest
        .spyOn(actor1, "stats", "get")
        .mockReturnValue({ givesExp: 10 } as unknown as Stats);
      jest
        .spyOn(actor2, "stats", "get")
        .mockReturnValue({ givesExp: 15 } as unknown as Stats);

      const sut = new Sut([actor1, actor2]);

      expect(sut.givesExp).toBe(25);
    });
  });

  describe("hasLastManStanding", () => {
    it("detects when has last man standing", () => {
      const actor1 = getPlayer();
      const actor2 = getPlayer();
      const sut = new Sut([actor1, actor2]);

      expect(sut.hasLastManStanding()).toBe(false);

      actor2.kill();
      expect(sut.hasLastManStanding()).toBe(true);

      actor1.kill();
      expect(sut.hasLastManStanding()).toBe(false);
    });
  });
});

const getVector = () => {
  return <Vector>(<unknown>{
    copy() {
      return getVector();
    },
    times() {
      return getVector();
    },
  });
};
