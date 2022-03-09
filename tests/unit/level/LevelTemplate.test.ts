import example from "../../assets/example.json";
import { LevelFixtureFactory } from "@/level/LevelFixtureFactory";
import { LevelTemplate as Sut } from "@/level/LevelTemplate";
import TiledMap from "tiled-types/types";

describe("LevelTemplate", () => {
  it("parses template json", () => {
    let sut = new Sut(example as unknown as TiledMap, getFixtureFactory());

    expect(2).toBe(sut.tiles.length);

    expect(2).toBe(Object.keys(sut.entries).length);
    expect(9).toBe(sut.fixtures.length);
    expect("some_file_name").toBe(sut.tileSource);
  });
});

const getFixtureFactory = () => {
  return <LevelFixtureFactory>(<unknown>{
    create() {
      return {};
    },
  });
};
