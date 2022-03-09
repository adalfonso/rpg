import NonPlayer from "@/actor/NonPlayer";
import { LevelFixtureFactory } from "@/level/LevelFixtureFactory";
import { LevelFixtureType } from "@/level/LevelFixture";
import { Milestone } from "@/state/milestone/Milestone";
import { getFixtureTemplate } from "./_fixtures";

describe("LevelFixtureFactory", () => {
  describe("create", () => {
    it("creates a NonPlayer", () => {
      const factory = new LevelFixtureFactory();
      const template = getFixtureTemplate({
        type: "_default_actor",
        name: "greet",
      });

      const result = factory.create(LevelFixtureType.NonPlayer, template);

      expect(result instanceof NonPlayer).toBe(true);
    });

    it("doesnt create a NonPlayer when attained", () => {
      jest
        .spyOn(Milestone.prototype, "attained", "get")
        .mockReturnValueOnce(true);

      const factory = new LevelFixtureFactory();
      const template = {
        ...getFixtureTemplate({
          type: "_default_actor",
          name: "greet",
        }),
        properties: [
          { name: "milestone", type: "string", value: "_default_milestone" },
        ],
      };

      const result = factory.create(LevelFixtureType.NonPlayer, template);

      expect(result).toBeNull();
    });
  });
});
