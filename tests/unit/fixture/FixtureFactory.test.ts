import { FixtureFactory } from "@/fixture/FixtureFactory";
import { FixtureType } from "@/fixture/Fixture";
import { NonPlayer } from "@/actor/NonPlayer";
import { getTiledTemplate } from "./_fixtures";

describe("LevelFixtureFactory", () => {
  describe("create", () => {
    it("creates a NonPlayer", async () => {
      const factory = new FixtureFactory();
      const template = getTiledTemplate({
        type: "_default_actor",
        name: "greet",
      });

      const result = await factory.create(FixtureType.NonPlayer, template);

      expect(result instanceof NonPlayer).toBe(true);
    });
  });
});
