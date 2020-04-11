import { expect } from "chai";
import { lcFirst } from "../../src/ts/util";

describe("util", () => {
  it("lcFirst", () => {
    [
      ["cat", "cat"],
      ["CAT", "cAT"],
      ["CAt", "cAt"],
    ].forEach((data) => {
      let [input, expected] = data;

      expect(lcFirst(input)).to.equal(expected);
    });
  });
});
