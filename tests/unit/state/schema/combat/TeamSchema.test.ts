import { isTeamState } from "@schema/combat/TeamSchema";

describe("TeamSchema", () => {
  describe("isTeamState", () => {
    [
      {
        label: "passes a valid structure",
        data: [
          {
            name: "player1",
            class: "player1",
            defeated: false,
            dmg: 0,
            lvl: 10,
            exp: 0,
            equipped: "big_sword",
            height: 1,
            width: 1,
          },
          {
            name: "player1",
            class: "player2",
            defeated: false,
            dmg: 0,
            lvl: 10,
            exp: 0,
            equipped: "big_sword",
            height: 1,
            width: 1,
          },
        ],
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: [
          {
            name: "player1",
            class: "player1",
            defeated: "invalid value",
            dmg: 0,
            lvl: 10,
            exp: 0,
            equipped: "big_sword",
          },
        ],
        expected: false,
      },
      {
        label: "fails an incomplete structure",
        data: [
          {
            type: "Team",
          },
        ],
        expected: false,
      },
      {
        label: "fails an empty structure",
        data: {},
        expected: false,
      },
    ].forEach(({ label, data, expected }) => {
      it(label, () => {
        expect(isTeamState(data)).toBe(expected);
      });
    });
  });
});
