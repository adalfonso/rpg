import "jest-canvas-mock";
import { MilestoneConfig } from "@/state/milestone/types";
import { ResizeObserver } from "./ResizeObserver";
import { getAbilityTemplate } from "../unit/fixture/_fixtures";
import { getActorConfig } from "../unit/actor/_fixtures";
import { matchMedia } from "./matchMedia";

// missing jsdom mocks needed by excalibur
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
global.ResizeObserver = ResizeObserver;
global.matchMedia = matchMedia;

jest.mock("@tauri-apps/api", () => {
  return {
    path: {
      join: () => Promise.resolve(""),
      dataDir: () => Promise.resolve(""),
    },
    fs: {
      Dir: { Data: 0 },
      createDir: () => {},
      readDir: () => Promise.resolve([]),
      writeFile: () => Promise.resolve(""),
      readTextFile: () => Promise.resolve(""),
    },
  };
});

jest.mock("@/util", () => {
  const original = jest.requireActual("@/util");

  return { ...original, getImagePath: () => "" };
});

jest.mock("@/actor/actors", () => ({
  actors: () => ({
    _default_actor: getActorConfig(),
    _default_enemy: getActorConfig(),
  }),
}));

jest.mock("@/combat/strategy/abilities", () => ({
  abilities: () => ({ damage: { _default_ability: getAbilityTemplate() } }),
}));

jest.mock("@/actor/speech", () => ({
  getSpeech: (input) => {
    const [k1, k2] = input.split(".");
    const manifest = {
      _default_actor: {
        greet: {
          dialogue: ["hello"],
        },
      },
    };

    return manifest[k1]?.[k2];
  },
}));

jest.mock("@/state/milestone/milestones", () => ({
  milestones: () => ({
    _default_milestone: {} as MilestoneConfig,
    _attained_milestone: () => ({ foo: {} as MilestoneConfig }),
    _unattained_milestone: () => ({ foo: {} as MilestoneConfig }),
  }),
}));
