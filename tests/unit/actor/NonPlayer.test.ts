import NonPlayer from "@/actor/NonPlayer";
import Vector from "@/physics/math/Vector";
import { getFixtureTemplate } from "../level/_fixtures";

describe("NonPlayer", () => {
  describe("constructor", () => {
    it("errors when it can't find speech", () => {
      expect(
        () =>
          new NonPlayer(
            Vector.empty(),
            Vector.empty(),
            getFixtureTemplate({
              type: "_default_actor",
              name: "_default_actor",
            })
          )
      ).toThrowError(
        'Speech data for "_default_actor._default_actor" as NonPlayer is not defined in speech.ts'
      );
    });
  });
});
