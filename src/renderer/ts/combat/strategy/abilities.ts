/**
 * All abilities in the game
 */
const abilities = {
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
  defend: {
    displayAs: "Defend",
    description: "Turn your elbow and absorb damage.",
    type: "def",
    value: 0.25,
    duration: 1,
    self: true,
    ui: {
      sprite: "missing",
    },
  },
};

export default abilities;
