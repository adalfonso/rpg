import NonPlayer from "@/actor/NonPlayer";
import { LevelFixtureFactory } from "@/level/LevelFixtureFactory";
import { LevelFixtureType } from "@/level/LevelFixture";
import { Milestone } from "@/state/milestone/Milestone";
import { MilestoneConfig } from "@/state/milestone/types";
import {
  getAbilityTemplate,
  getActorTemplate,
  getFixtureTemplate,
} from "./fixtures";

jest.mock("@/actor/actors", () => ({
  actors: () => ({ foo_fixture: getActorTemplate() }),
}));

jest.mock("@/combat/strategy/abilities", () => ({
  abilities: () => ({ damage: { _default_ability: getAbilityTemplate() } }),
}));

jest.mock("@/actor/speech", () => ({ getSpeech: () => [] }));

jest.mock("@/state/milestone/milestones", () => ({
  milestones: () => ({ foo: {} as MilestoneConfig }),
}));

describe("LevelFixtureFactory", () => {
  describe("create", () => {
    it("creates a NonPlayer", () => {
      const factory = new LevelFixtureFactory();
      const template = getFixtureTemplate({
        type: "foo_fixture",
        name: "foo_fixture",
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
          type: "foo_fixture",
          name: "foo_fixture",
        }),
        properties: [{ name: "milestone", type: "string", value: "foo" }],
      };

      const result = factory.create(LevelFixtureType.NonPlayer, template);

      expect(result).toBeNull();
    });
  });
});
