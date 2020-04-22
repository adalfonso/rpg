import { expect } from "chai";
import Sut from "../../src/renderer/ts/LevelTemplate";
import example from "../assets/example.json";

describe("LevelTemplate", () => {
  it("should parse template json", () => {
    let sut = new Sut(example);

    expect(2).to.equal(sut.tiles.length);

    expect(2).to.equal(Object.keys(sut.entries).length);
    expect(8).to.equal(sut.fixtures.length);
    expect("some_file_name").to.equal(sut.tileSource);
  });
});
