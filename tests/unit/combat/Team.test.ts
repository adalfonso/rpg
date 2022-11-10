import Stats from "@/actor/Stats";
import Team from "@/combat/Team";
import { Actor } from "@/actor/Actor";
import { Direction } from "@/ui/types";
import { Vector } from "excalibur";
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

      const team = new Team([actor1, actor2]);

      expect(team.areDefeated).toBe(true);
    });

    it("detects when the team is not yet defeated", () => {
      const team = new Team([getPlayer(), getPlayer()]);

      expect(team.areDefeated).toBe(false);
    });
  });

  describe("leader", () => {
    it("gets the team leader", () => {
      const actor1 = getPlayer();
      const actor2 = getPlayer();

      const team = new Team([actor1, actor2]);

      expect(team.leader).toBe(actor1);
    });
  });

  describe("length", () => {
    it("gets the team length", () => {
      const team = new Team([getPlayer(), getPlayer()]);

      expect(team.length).toBe(2);
    });
  });

  describe("each", () => {
    it("applies something to each member", () => {
      const team = new Team([getPlayer(), getPlayer()]);
      let timesCalled = 0;

      team.each((_actor: Actor) => {
        timesCalled++;
      });

      expect(timesCalled).toBe(2);
    });
  });

  describe("prepare", () => {
    it("set direction and position of team members", () => {
      const team = new Team([getPlayer(), getPlayer()]);

      // const position = new Vector(5, 6);
      const direction = Direction.East;

      const members = team.all();
      const leader = team.leader;

      expect(leader.direction).not.toBe(Direction.East);
      expect(leader.position.x).not.toBe(5);
      expect(leader.position.y).not.toBe(6);

      team.prepare(direction);

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
      const team = new Team(actors);

      expect(team.all()).toBe(actors);
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

      const sut = new Team([actor1, actor2]);

      expect(sut.givesExp).toBe(25);
    });
  });

  describe("hasLastManStanding", () => {
    it("detects when has last man standing", () => {
      const actor1 = getPlayer();
      const actor2 = getPlayer();
      const team = new Team([actor1, actor2]);

      expect(team.hasLastManStanding()).toBe(false);

      actor2.kill();
      expect(team.hasLastManStanding()).toBe(true);

      actor1.kill();
      expect(team.hasLastManStanding()).toBe(false);
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
