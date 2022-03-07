import { isItemState } from "@schema/inanimate/ItemSchema";
import { expect } from "chai";

describe("ItemSchema", () => {
  describe("isItemState", () => {
    [
      {
        label: "passes a valid structure",
        data: {
          obtained: false,
        },
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: {
          obtained: 5,
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
        expect(isItemState(data)).to.equal(expected);
      });
    });
  });
});
