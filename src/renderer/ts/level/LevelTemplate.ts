import InvalidDataError from "@/error/InvalidDataError";
import MissingDataError from "@/error/MissingDataError";
import { LevelFixture, LevelFixtureType } from "./LevelFixture";
import { LevelFixtureFactory } from "./LevelFixtureFactory";

/** LevelTemplate parses level json and provides easier acces to data */
export class LevelTemplate {
  /** Main fixtures of the level */
  private _fixtures: LevelFixture[] = [];

  /** Visual layer/tileset data */
  private _tiles: any[];

  /**
   * Entry/loading points on a level
   *
   * NOTE: Entries are considered level fixtures but are stored separately in an
   * object because they are queried often.
   */
  private _entries: Record<string, unknown> = {};

  /** Name reference to tile set image */
  private _tile_source: string;

  /**
   * Create a new LevelTemplate instance
   *
   * @param json - level data
   *
   * @throws {MissingDataError} when tile layers or tile source are missing
   */
  constructor(
    json: Record<string, any>,
    private _fixture_factory: LevelFixtureFactory
  ) {
    const layers = json.layers ?? [];

    this._tiles = this.getTileLayers(layers);

    if (!this._tiles.length) {
      throw new MissingDataError(
        "Tile layers not found when loading map json."
      );
    }

    this._tile_source = this.getJsonProperty(json, "tile_source");

    if (!this._tile_source) {
      throw new MissingDataError(
        `Unable to find tile source when loading template.`
      );
    }

    const objectGroups = this.getObjectGroups(layers);
    const entries = objectGroups.entry?.objects ?? [];

    entries.forEach((e: any) => {
      this._entries[e.name] = this._fixture_factory.create(
        LevelFixtureType.Entry,
        e
      );
    });

    [
      LevelFixtureType.Clip,
      LevelFixtureType.Enemy,
      LevelFixtureType.Portal,
      LevelFixtureType.NonPlayer,
      LevelFixtureType.Item,
    ].forEach((type: LevelFixtureType) => {
      const group = objectGroups[type] ?? { objects: [] };
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
  get tiles(): any[] {
    return this._tiles;
  }

  /** Entry/loading points on a level */
  get entries(): Record<string, unknown> {
    return this._entries;
  }

  /** Name reference to tile set image */
  get tileSource(): string {
    return this._tile_source;
  }

  /** Main fixtures of the level */
  get fixtures(): LevelFixture[] {
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
  private getJsonProperty(json: Record<string, any>, property: string): string {
    const properties = json.properties ?? [];

    return properties
      .filter((prop: any) => prop.name === property)
      .map((prop: any) => prop.value)[0];
  }

  /**
   * Get the tile layers from the level data
   *
   * @param layers - layer data
   *
   * @return tile layers
   */
  private getTileLayers(layers: any[]): Record<string, unknown>[] {
    return layers.filter((l) => l.type === "tilelayer");
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
  private getObjectGroups(layers: any[]): any {
    const objectGroups: any = {};

    layers.filter((l) => {
      if (l.type !== "objectgroup") {
        return;
      }

      if (objectGroups[l.name]) {
        throw new InvalidDataError(
          `Duplicate name for object layers: ${l.name}`
        );
      }

      objectGroups[l.name] = l;
    });

    return objectGroups;
  }
}
