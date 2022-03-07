import { expect } from "chai";
import { isTeamState } from "@/state/schema/combat/TeamSchema";

describe("TeamSchema", () => {
  describe("isTeamState", () => {
    [
      {
        label: "passes a valid structure",
        data: [
          {
            type: "Team",
            defeated: false,
            dmg: 0,
            lvl: 10,
            exp: 0,
            equipped: "big_sword",
          },
          {
            type: "Team",
            defeated: false,
            dmg: 0,
            lvl: 10,
            exp: 0,
            equipped: "big_sword",
          },
        ],
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: [
          {
            type: "Team",
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
        expect(isTeamState(data)).to.equal(expected);
      });
    });
  });
});
