import NonPlayer from "@/actor/NonPlayer";
import actors from "@/actor/actors";
import sinon from "sinon";
import { LevelFixtureFactory } from "@/level/LevelFixtureFactory";
import { LevelFixtureType } from "@/level/LevelFixture";
import { Milestone } from "@/state/milestone/Milestone";
import { MilestoneConfig } from "@/state/milestone/types";
import { expect } from "chai";
import { getActorTemplate, getFixtureTemplate } from "./fixtures";
import { milestone_list } from "@/state/milestone/milestones";
import { speech_list } from "@/actor/speech";

beforeEach(() => {
  actors.foo_fixture = getActorTemplate();
  speech_list.foo_fixture = { foo_fixture: { dialogue: [] } };
  milestone_list.foo = {} as MilestoneConfig;
});

afterEach(() => {
  sinon.restore();
});

describe("LevelFixtureFactory", () => {
  describe("create", () => {
    it("creates a NonPlayer", () => {
      const factory = new LevelFixtureFactory();
      const template = getFixtureTemplate({
        type: "foo_fixture",
        name: "foo_fixture",
      });

      const result = factory.create(LevelFixtureType.NonPlayer, template);

      expect(result instanceof NonPlayer).to.be.true;
    });

    it("doesnt create a NonPlayer when attained", () => {
      sinon.stub(Milestone.prototype, "attained").value(true);

      const factory = new LevelFixtureFactory();
      const template = {
        ...getFixtureTemplate({
          type: "foo_fixture",
          name: "foo_fixture",
        }),
        properties: [{ name: "milestone", type: "string", value: "foo" }],
      };

      const result = factory.create(LevelFixtureType.NonPlayer, template);

      expect(result).to.be.null;
    });
  });
});
