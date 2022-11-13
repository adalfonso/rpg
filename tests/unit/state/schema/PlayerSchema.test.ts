import { isPlayerState } from "@schema/actor/PlayerSchema";

describe("PlayerSchema", () => {
  describe("isPlayerState", () => {
    [
      {
        label: "passes a valid structure",
        data: {
          name: "player1",
          class: "Player",
          defeated: false,
          dmg: 0,
          lvl: 10,
          exp: 0,
          equipped: "big_sword",
          height: 1,
          width: 1,
        },
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: {
          class: "Player",
          defeated: "invalid value",
          dmg: 0,
          lvl: 10,
          exp: 0,
          equipped: "big_sword",
        },
        expected: false,
      },
      {
        label: "fails an incomplete structure",
        data: {
          class: "Player",
        },
        expected: false,
      },
      {
        label: "fails an empty structure",
        data: {},
        expected: false,
      },
    ].forEach(({ label, data, expected }) => {
      it(label, () => {
        expect(isPlayerState(data)).toBe(expected);
      });
    });
  });
});
