import { isPlayerState } from "@schema/actor/PlayerSchema";

describe("PlayerSchema", () => {
  describe("isPlayerState", () => {
    [
      {
        label: "passes a valid structure",
        data: {
          type: "Player",
          defeated: false,
          dmg: 0,
          lvl: 10,
          exp: 0,
          equipped: "big_sword",
        },
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: {
          type: "Player",
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
          type: "Player",
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
