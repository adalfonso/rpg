import Stats from "@/actor/Stats";
import { HeroTeam } from "@/combat/HeroTeam";
import { getPlayer } from "../actor/_fixtures";

describe("HeroTeam", () => {
  describe("gainExp", () => {
    it("distributes exp to team members", () => {
      const actor1 = getPlayer();
      const actor2 = getPlayer();

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
      const actor1 = getPlayer();
      const actor2 = getPlayer();
      const actor3 = getPlayer();

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
      const actor1 = getPlayer();
      const actor2 = getPlayer();

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
