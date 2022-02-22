import NonPlayer from "@/actor/NonPlayer";
import Vector from "@common/Vector";
import actors from "@/actor/actors";
import { expect } from "chai";
import { getActorTemplate, getFixtureTemplate } from "../level/fixtures";
import { speech_list } from "@/actor/speech";

beforeEach(() => {
  actors.foo_non_player = getActorTemplate();
});

describe("NonPlayer", () => {
  describe("constructor", () => {
    it("errors when it can't find speech", () => {
      console.log({ speech_list });
      expect(
        () =>
          new NonPlayer(
            new Vector(0, 0),
            new Vector(0, 0),
            getFixtureTemplate({
              type: "foo_non_player",
              name: "foo_non_player",
            })
          )
      ).to.throw(
        'Speech data for "foo_non_player.foo_non_player" as NonPlayer is not defined in speech.ts'
      );
    });
  });
});
