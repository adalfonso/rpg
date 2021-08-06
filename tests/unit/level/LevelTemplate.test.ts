import example from "../../assets/example.json";
import { LevelFixtureFactory } from "@/level/LevelFixtureFactory";
import { LevelTemplate as Sut } from "@/level/LevelTemplate";
import { expect } from "chai";

describe("LevelTemplate", () => {
  it("parses template json", () => {
    let sut = new Sut(example, getFixtureFactory());

    expect(2).to.equal(sut.tiles.length);

    expect(2).to.equal(Object.keys(sut.entries).length);
    expect(9).to.equal(sut.fixtures.length);
    expect("some_file_name").to.equal(sut.tileSource);
  });
});

const getFixtureFactory = () => {
  return <LevelFixtureFactory>(<unknown>{
    create() {
      return {};
    },
  });
};
