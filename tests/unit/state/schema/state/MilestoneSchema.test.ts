import { isMilestoneState } from "@/state/schema/state/milestone/MilestoneSchema";
import { expect } from "chai";

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
        expect(isMilestoneState(data)).to.equal(expected);
      });
    });
  });
});
