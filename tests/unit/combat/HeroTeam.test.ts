import Player from "@/actor/Player";
import Stats from "@/Stats";
import Vector from "@common/Vector";
import { HeroTeam } from "@/combat/HeroTeam";

describe("HeroTeam", () => {
  describe("gainExp", () => {
    it("distributes exp to team members", () => {
      const actor1 = getActor();
      const actor2 = getActor();

      let actor1Exp = 0;
      let actor2Exp = 0;

      jest
        .spyOn(actor1, "gainExp")
        .mockImplementationOnce((exp) => (actor1Exp = exp));

      jest
        .spyOn(actor2, "gainExp")
        .mockImplementationOnce((exp) => (actor2Exp = exp));

      const sut = new HeroTeam([actor1, actor2]);

      sut.gainExp(20);

      expect(actor1Exp).toBe(10);
      expect(actor2Exp).toBe(10);
    });

    it("distributes exp to team members when number is not perfectly divisible ", () => {
      const actor1 = getActor();
      const actor2 = getActor();
      const actor3 = getActor();

      let actor1Exp = 0;
      let actor2Exp = 0;
      let actor3Exp = 0;

      jest
        .spyOn(actor1, "gainExp")
        .mockImplementationOnce((exp) => (actor1Exp = exp));

      jest
        .spyOn(actor2, "gainExp")
        .mockImplementationOnce((exp) => (actor2Exp = exp));

      jest
        .spyOn(actor3, "gainExp")
        .mockImplementationOnce((exp) => (actor3Exp = exp));

      const sut = new HeroTeam([actor1, actor2, actor3]);

      sut.gainExp(20);

      expect(actor1Exp).toBe(7);
      expect(actor2Exp).toBe(7);
      expect(actor3Exp).toBe(7);
    });
  });

  describe("givesExp", () => {
    it("calculates exp yielded by a team", () => {
      const actor1 = getActor();
      const actor2 = getActor();

      jest.spyOn(actor1, "stats", "get").mockReturnValue({
        givesExp: 10,
      } as Stats);

      jest.spyOn(actor2, "stats", "get").mockReturnValue({
        givesExp: 15,
      } as Stats);

      const sut = new HeroTeam([actor1, actor2]);

      expect(sut.givesExp).toBe(25);
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
