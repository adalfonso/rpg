import { AbilityManifest } from "./types";

/** All abilities in the game */
const abilities: AbilityManifest = {
  damage: {
    mega_punch: {
      displayAs: "Mega Punch",
      description: "Knock 'em out.",
      value: 20,
      isSpecial: false,
      ui: {
        sprite: "missing",
      },
    },
    twister: {
      displayAs: "Twister",
      description: "Do that twister!",
      value: 13,
      isSpecial: true,
      ui: {
        sprite: "missing",
      },
    },
  },
  stat: {
    defend: {
      displayAs: "Defend",
      description: "Turn your elbow and absorb damage.",
      stat: "def",
      value: 0.25,
      duration: 1,
      self: true,
      ui: {
        sprite: "missing",
      },
    },
  },
};

export default abilities;
