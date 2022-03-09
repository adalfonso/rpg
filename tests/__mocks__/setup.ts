import { MilestoneConfig } from "@/state/milestone/types";
import { getAbilityTemplate } from "../unit/level/_fixtures";
import { getActorTemplate } from "../unit/actor/_fixtures";

jest.mock("@/util", () => {
  const original = jest.requireActual("@/util");

  return { ...original, getImagePath: () => "" };
});

jest.mock("@/actor/actors", () => ({
  actors: () => ({
    _default_actor: getActorTemplate(),
    _default_enemy: getActorTemplate(),
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
