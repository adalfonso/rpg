import { expect } from "chai";
import Sut from "@common/Vector";

describe("Vector", () => {
  it("creates a new instance", () => {
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

  describe("copy", () => {
    it("copies a vector", () => {
      [new Sut(0, 0), new Sut(2, 4), new Sut(-5, -100)].forEach((sut) => {
        let copy = sut.copy();

        expect(copy).to.not.equal(sut);
        expect(copy).to.deep.equal(sut);
      });
    });
  });

  describe("plus", () => {
    it("adds two vectors together", () => {
      [
        [new Sut(0, 0), new Sut(4, 5), new Sut(4, 5)],
        [new Sut(2, 4), new Sut(1, 3), new Sut(3, 7)],
        [new Sut(-5, -100), new Sut(200, -300), new Sut(195, -400)],
      ].forEach((data: Sut[]) => {
        let [sut, input, expected] = data;

        expect(sut.plus(input)).to.deep.equal(expected);
      });
    });
  });

  describe("minus", () => {
    it("subtracts one vector from another", () => {
      [
        [new Sut(0, 0), new Sut(4, 5), new Sut(-4, -5)],
        [new Sut(2, 4), new Sut(1, 3), new Sut(1, 1)],
        [new Sut(-5, -100), new Sut(200, -300), new Sut(-205, 200)],
      ].forEach((data: Sut[]) => {
        let [sut, input, expected] = data;

        expect(sut.minus(input)).to.deep.equal(expected);
      });
    });
  });

  describe("times", () => {
    it("multiplies a vector by a scalar", () => {
      [
        [new Sut(0, 0), 4, new Sut(0, 0)],
        [new Sut(2, 4), 1.5, new Sut(3, 6)],
        [new Sut(-5, -100), -1, new Sut(5, 100)],
      ].forEach((data: [Sut, number, Sut]) => {
        let [sut, input, expected] = data;

        expect(sut.times(input)).to.deep.equal(expected);
      });
    });

    it("multiplies a vector by a vector", () => {
      [
        [new Sut(3, 3), new Sut(0, 1), new Sut(0, 3)],
        [new Sut(2, 4), new Sut(1.5, -10), new Sut(3, -40)],
      ].forEach((data: Sut[]) => {
        let [sut, input, expected] = data;

        expect(sut.times(input)).to.deep.equal(expected);
      });
    });
  });

  describe("toArray", () => {
    it("turns the vector into an array", () => {
      [
        [new Sut(0, 0), [0, 0]],
        [new Sut(2, 4), [2, 4]],
      ].forEach((data: [Sut, [number, number]]) => {
        let [sut, expected] = data;

        expect(sut.toArray()).to.deep.equal(expected);
      });
    });
  });

  describe("apply", () => {
    it("it applies Math.round", () => {
      [
        [new Sut(1.1, 2.9), new Sut(1, 3)],
        [new Sut(2, 4.5), new Sut(2, 5)],
      ].forEach((data: [Sut, Sut]) => {
        let [sut, expected] = data;

        expect(sut.apply(Math.round)).to.deep.equal(expected);
      });
    });
  });
});
