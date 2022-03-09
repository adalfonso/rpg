import { isMilestoneState } from "@schema/state/milestone/MilestoneSchema";

describe("MilestoneSchema", () => {
  describe("isMilestoneState", () => {
    [
      {
        label: "passes a valid structure",
        data: {
          attained: true,
        },
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: {
          attained: 5,
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
        expect(isMilestoneState(data)).toBe(expected);
      });
    });
  });
});
