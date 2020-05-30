import Clip from "./inanimates/Clip";
import Enemy from "./actors/Enemy";
import Entry from "./inanimates/Entry";
import InvalidDataError from "./error/InvalidDataError";
import Item from "./inanimates/Item";
import MissingDataError from "./error/MissingDataError";
import NonPlayer from "./actors/NonPlayer";
import Portal from "./inanimates/Portal";
import Vector from "@common/Vector";
import config from "./config";

/**
 * Type of fixtures to expect in a level
 */
export type LevelFixture = Clip | Enemy | Portal | NonPlayer | Entry | Item;

/**
 * LevelTemplate parses level json and provides easier acces to data
 */
class LevelTemplate {
  /**
   * Main fixtures of the level
   */
  private _fixtures: LevelFixture[] = [];

  /**
   * Visual layer/tileset data
   */
  private _tiles: any[];

  /**
   * Entry/loading points on a level
   *
   * NOTE: Entries are considered level fixtures but are stored separately in an
   * object because they are queried often.
   */
  private _entries: object = {};

  /**
   * Name reference to tile set image
   */
  private _tileSource: string;

  /**
   * Create a new LevelTemplate instance
   *
   * @param json - level data
   *
   * @throws {MissingDataError} when tile layers or tile source are missing
   */
  constructor(json: any) {
    let layers = json.layers ?? [];

    this._tiles = this.getTileLayers(layers);

    if (!this._tiles.length) {
      throw new MissingDataError(
        "Tile layers not found when loading map json."
      );
    }

    this._tileSource = this.getJsonProperty(json, "tile_source");

    if (!this._tileSource) {
      throw new MissingDataError(
        `Unable to find tile source when loading template.`
      );
    }

    let objectGroups = this.getObjectGroups(layers);
    let entries = objectGroups.entry?.objects ?? [];

    entries.forEach((e: any) => {
      this._entries[e.name] = this.createFixture("entry", e);
    });

    ["clip", "enemy", "portal", "npc", "item"].forEach((type) => {
      let group = objectGroups[type] ?? { objects: [] };
      let fixtures = group.objects.flat();

      if (!fixtures.length) {
        return;
      }

      fixtures.forEach((object: any) => {
        let fixture = this.createFixture(type, object);

        if (fixture !== null) {
          this._fixtures.push(fixture);
        }
      });
    });
  }

  /**
   * Visual layer/tileset data
   */
  get tiles(): any[] {
    return this._tiles;
  }

  /**
   * Entry/loading points on a level
   */
  get entries(): object {
    return this._entries;
  }

  /**
   * Name reference to tile set image
   */
  get tileSource(): string {
    return this._tileSource;
  }

  /**
   * Main fixtures of the level
   */
  get fixtures(): LevelFixture[] {
    return this._fixtures;
  }

  /**
   * Load a single fixture from a layer object
   *
   * @param type    - fixture type
   * @param fixture - fixture data
   *
   * @return resulting fixture instance
   *
   * @throws {MissingDataError} when x, y, width, or height are missing
   * @throws {InvalidDataError} when the type is invalid
   */
  private createFixture(type: string, fixture: any): LevelFixture {
    ["x", "y", "width", "height"].forEach((prop) => {
      if (!fixture.hasOwnProperty(prop)) {
        throw new MissingDataError(
          `Cannot find property "${prop}" when loading fixture "${type}".`
        );
      }
    });

    let position = new Vector(fixture.x, fixture.y).times(config.scale);
    let size = new Vector(fixture.width, fixture.height).times(config.scale);

    switch (type) {
      case "clip":
        return new Clip(position, size);
      case "portal":
        return new Portal(position, size, fixture);
      case "entry":
        return new Entry(position, size);
      case "npc":
        return new NonPlayer(fixture);
      case "enemy":
        let enemy = new Enemy(fixture);
        return enemy.defeated ? null : enemy;
      case "item":
        let item = new Item(position, size, fixture);
        return item.obtained ? null : item;
      default:
        throw new InvalidDataError(
          `Unable to create fixture for object type "${type}".`
        );
    }
  }

  /**
   * Get the value of a custom property from template data
   *
   * @param template - level data
   * @param property - property name to locate
   *
   * @return property's value
   */
  private getJsonProperty(json: any, property: string): string {
    let properties = json.properties ?? [];

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
  private getTileLayers(layers: any[]): object[] {
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
    let objectGroups: any = {};

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

export default LevelTemplate;
