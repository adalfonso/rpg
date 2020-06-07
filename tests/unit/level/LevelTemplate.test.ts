import { expect } from "chai";
import Sut from "@/level/LevelTemplate";
import example from "../../assets/example.json";

describe("LevelTemplate", () => {
  it("parses template json", () => {
    let sut = new Sut(example);

    expect(2).to.equal(sut.tiles.length);

    expect(2).to.equal(Object.keys(sut.entries).length);
    expect(9).to.equal(sut.fixtures.length);
    expect("some_file_name").to.equal(sut.tileSource);
  });
});
