import { expect } from "chai";
import Sut from "../../src/common/Vector";

describe("Vector", () => {
  it("new", () => {
    [
      [0, 0],
      [2, 4],
      [-5, -100],
    ].forEach((data) => {
      let [x, y] = data;
      let sut = new Sut(x, y);

      expect(sut.x).to.equal(x);
      expect(sut.y).to.equal(y);
    });
  });

  it("copy", () => {
    [new Sut(0, 0), new Sut(2, 4), new Sut(-5, -100)].forEach((sut) => {
      let copy = sut.copy();

      expect(copy).to.not.equal(sut);
      expect(copy).to.deep.equal(sut);
    });
  });

  it("plus", () => {
    [
      [new Sut(0, 0), new Sut(4, 5), new Sut(4, 5)],
      [new Sut(2, 4), new Sut(1, 3), new Sut(3, 7)],
      [new Sut(-5, -100), new Sut(200, -300), new Sut(195, -400)],
    ].forEach((data: [Sut, Sut, Sut]) => {
      let [sut, input, expected] = data;

      expect(sut.plus(input)).to.deep.equal(expected);
    });
  });

  it("times", () => {
    [
      [new Sut(0, 0), 4, new Sut(0, 0)],
      [new Sut(2, 4), 1.5, new Sut(3, 6)],
      [new Sut(-5, -100), -1, new Sut(5, 100)],
      [new Sut(3, 3), new Sut(0, 1), new Sut(0, 3)],
      [new Sut(2, 4), new Sut(1.5, -10), new Sut(3, -40)],
    ].forEach((data: [Sut, Sut | number, Sut]) => {
      let [sut, input, expected] = data;

      expect(sut.times(input)).to.deep.equal(expected);
    });
  });

  it("toArray", () => {
    [
      [new Sut(0, 0), [0, 0]],
      [new Sut(2, 4), [2, 4]],
    ].forEach((data: [Sut, [number, number]]) => {
      let [sut, expected] = data;

      expect(sut.toArray()).to.deep.equal(expected);
    });
  });
});
