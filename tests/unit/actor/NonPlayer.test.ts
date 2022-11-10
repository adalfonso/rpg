import { NonPlayer } from "@/actor/NonPlayer";
import { getTiledTemplate } from "../level/_fixtures";

describe("NonPlayer", () => {
  describe("constructor", () => {
    it("errors when it can't find speech", () => {
      expect(
        () =>
          new NonPlayer(
            getTiledTemplate({
              class: "_default_actor",
              name: "_default_actor",
            })
          )
      ).toThrowError(
        'Speech data for "_default_actor._default_actor" as NonPlayer is not defined in speech.ts'
      );
    });
  });
});
