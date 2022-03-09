import NonPlayer from "@/actor/NonPlayer";
import Vector from "@common/Vector";
import {
  getAbilityTemplate,
  getActorTemplate,
  getFixtureTemplate,
} from "../level/fixtures";

jest.mock("@/actor/actors", () => ({
  __esModule: true,
  actors: () => ({ foo_non_player: getActorTemplate() }),
}));

jest.mock("@/combat/strategy/abilities", () => ({
  abilities: () => ({ damage: { _default_ability: getAbilityTemplate() } }),
}));

describe("NonPlayer", () => {
  describe("constructor", () => {
    it("errors when it can't find speech", () => {
      expect(
        () =>
          new NonPlayer(
            Vector.empty(),
            Vector.empty(),
            getFixtureTemplate({
              type: "foo_non_player",
              name: "foo_non_player",
            })
          )
      ).toThrowError(
        'Speech data for "foo_non_player.foo_non_player" as NonPlayer is not defined in speech.ts'
      );
    });
  });
});
