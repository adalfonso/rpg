import NonPlayer from "@/actor/NonPlayer";
import actors from "@/actor/actors";
import sinon from "sinon";
import { LevelFixtureFactory } from "@/level/LevelFixtureFactory";
import { LevelFixtureType } from "@/level/LevelFixture";
import { Milestone } from "@/state/Milestone";
import { expect } from "chai";

beforeEach(() => {
  actors.foo = getActorTemplate();
});

afterEach(() => {
  sinon.restore();
});

describe("LevelFixtureFactory", () => {
  describe("create", () => {
    it("creates a NonPlayer", () => {
      const factory = new LevelFixtureFactory();
      const template = getFixtureTemplate();

      const result = factory.create(LevelFixtureType.NonPlayer, template);

      expect(result instanceof NonPlayer).to.be.true;
    });

    it("doesnt create a NonPlayer when obtained", () => {
      sinon.stub(Milestone.prototype, "obtained").value(true);

      const factory = new LevelFixtureFactory();
      const template = {
        ...getFixtureTemplate(),
        properties: [{ name: "milestone", type: "string", value: "foo" }],
      };

      const result = factory.create(LevelFixtureType.NonPlayer, template);

      expect(result).to.be.null;
    });
  });
});

const getFixtureTemplate = () => ({
  x: 0,
  y: 0,
  height: 0,
  width: 0,
  name: "foo",
  type: "foo",
  value: "",
  properties: [] as any[],
});

const getActorTemplate = () => ({
  displayAs: "Mr Foo",
  base_stats: { hp: 120, atk: 125, def: 85, sp_atk: 95, sp_def: 65, spd: 105 },
  ui: {
    sprite: "missing",
    frames: { x: 1, y: 4, idle: 1, north: 1, east: 1, south: 1, west: 1 },
    scale: 1,
    fps: 8,
  },
  abilities: [{ ref: "bar", level: 6 }],
});
