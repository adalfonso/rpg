import InvalidDataError from "@/error/InvalidDataError";
import MissingDataError from "@/error/MissingDataError";
import { LevelFixture, LevelFixtureType } from "./LevelFixture";
import { LevelFixtureFactory } from "./LevelFixtureFactory";
import TiledMap, {
  TiledLayerTilelayer,
  TiledLayerObjectgroup,
} from "tiled-types";
import Entry from "@/inanimate/Entry";

/** LevelTemplate parses level json and provides easier acces to data */
export class LevelTemplate {
  /** Main fixtures of the level */
  private _fixtures: LevelFixture[] = [];

  /** Visual layer/tileset data */
  private _tiles: TiledLayerTilelayer[];

  /**
   * Entry/loading points on a level
   *
   * NOTE: Entries are considered level fixtures but are stored separately in an
   * object because they are queried often.
   */
  private _entries: Record<string, Entry> = {};

  /** Name reference to tile set image */
  private _tile_source: string;

  /**
   * Create a new LevelTemplate instance
   *
   * @param map - level data
   *
   * @throws {MissingDataError} when tile layers or tile source are missing
   */
  constructor(map: TiledMap, private _fixture_factory: LevelFixtureFactory) {
    this._tiles = this.getTileLayers(map);

    if (!this._tiles.length) {
      throw new MissingDataError(
        "Tile layers not found when loading map json."
      );
    }

    this._tile_source = this.getMapProperty(map, "tile_source");

    if (!this._tile_source) {
      throw new MissingDataError(
        `Unable to find tile source when loading template.`
      );
    }

    const objectGroups = this.getObjectGroups(map);
    const entries = objectGroups.entry?.objects ?? [];

    this._entries = entries.reduce((carry, e) => {
      return {
        ...carry,
        [e.name]: this._fixture_factory.create(LevelFixtureType.Entry, e),
      };
    }, {});

    [
      LevelFixtureType.Enemy,
      LevelFixtureType.Portal,
      LevelFixtureType.NonPlayer,
      LevelFixtureType.Item,
    ].forEach((type: LevelFixtureType) => {
      const group = objectGroups[type] ?? { objects: [] as unknown[] };
      const fixture_data = group.objects.flat();

      fixture_data.forEach((object: unknown) => {
        const fixture = this._fixture_factory.create(type, object);

        if (fixture !== null) {
          this._fixtures.push(fixture);
        }
      });
    });
  }

  /** Visual layer/tileset data */
  get tiles() {
    return this._tiles;
  }

  /** Entry/loading points on a level */
  get entries() {
    return this._entries;
  }

  /** Name reference to tile set image */
  get tileSource() {
    return this._tile_source;
  }

  /** Main fixtures of the level */
  get fixtures() {
    return this._fixtures;
  }

  /**
   * Get the value of a custom property from template data
   *
   * @param template - level data
   * @param property - property name to locate
   *
   * @return property's value
   */
  private getMapProperty(map: TiledMap, property: string) {
    const properties = map.properties ?? [];

    return properties
      .filter(({ name }) => name === property)
      .map(({ value }) => value)
      .map(String)[0];
  }

  /**
   * Get the tile layers from the level data
   *
   * @param layers - layer data
   *
   * @return tile layers
   */
  private getTileLayers(map: TiledMap) {
    return map.layers.filter(
      (l): l is TiledLayerTilelayer => l.type === "tilelayer"
    );
  }

  /**
   * Get the object groups from the level data
   *
   * @param layers - layer data
   *
   * @return object groups
   *
   * @throws {InvalidDataError} when multiple object layers share a name
   */
  private getObjectGroups(
    map: TiledMap
  ): Record<string, TiledLayerObjectgroup> {
    return map.layers
      .filter((l): l is TiledLayerObjectgroup => l.type === "objectgroup")
      .reduce((carry, l) => {
        if (carry[l.name]) {
          throw new InvalidDataError(
            `Duplicate name for object layers: ${l.name}`
          );
        }

        return { ...carry, [l.name]: l };
      }, {});
  }
}
