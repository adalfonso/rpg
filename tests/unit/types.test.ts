import { isStringArray } from "@/types";
import { expect } from "chai";

describe("types", () => {
  describe("isStringArray", () => {
    [
      ["is true for string array", ["1"], true],
      ["is true for empty array", [], true],
      ["is false for number array", [1], false],
      ["is false forstring", "foo", false],
    ].forEach(([label, input, expected]) => {
      it(label as string, () => {
        expect(isStringArray(input)).to.equal(expected);
      });
    });
  });
});
