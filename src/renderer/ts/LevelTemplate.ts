import Clip from "./inanimates/Clip";
import Enemy from "./actors/Enemy";
import Entry from "./inanimates/Entry";
import Item from "./inanimates/Item";
import NonPlayer from "./actors/NonPlayer";
import Portal from "./inanimates/Portal";
import Vector from "@common/Vector";
import config from "./config";

/**
 * Type of fixtures to expect in a level
 *
 * @type {LevelFixture}
 */
export type LevelFixture = Clip | Enemy | Portal | NonPlayer | Entry | Item;

/**
 * LevelTemplate parses level json and provides easier acces to data
 */
class LevelTemplate {
  /**
   * Main fixtures of the level
   *
   * @prop {LevelFixture[]} _fixtures
   */
  private _fixtures: LevelFixture[] = [];

  /**
   * Visual layer/tileset data
   *
   * @prop {any[]} _tiles
   */
  private _tiles: any[];

  /**
   * Entry/loading points on a level
   *
   * NOTE: Entries are considered level fixtures but are stored separately in an
   * object because they are queried often.
   *
   * @prop {object} _entries
   */
  private _entries: object = {};

  /**
   * Name reference to tile set image
   *
   * @prop {string} _tileSource
   */
  private _tileSource: string;

  /**
   * Create a new LevelTemplate instance
   *
   * @param {object} json Level data
   */
  constructor(json) {
    let layers = json.layers ?? [];

    this._tiles = this.getTileLayers(layers);

    if (!this._tiles.length) {
      throw new Error("Tile layers not found when loading map json.");
    }

    this._tileSource = this.getJsonProperty(json, "tile_source");

    if (!this._tileSource) {
      throw new Error(`Unable to find tile source when loading template.`);
    }

    let objectGroups = this.getObjectGroups(layers);
    let entries = objectGroups.entry?.objects ?? [];

    entries.forEach((e) => {
      this._entries[e.name] = this.createFixture("entry", e);
    });

    ["clip", "enemy", "portal", "npc", "item"].forEach((type) => {
      let group = objectGroups[type] ?? { objects: [] };
      let fixtures = group.objects.flat();

      if (!fixtures.length) {
        return;
      }

      fixtures.forEach((object) => {
        let fixture = this.createFixture(type, object);

        if (fixture !== null) {
          this._fixtures.push(fixture);
        }
      });
    });
  }

  /**
   * Visual layer/tileset data
   *
   * @prop {any[]} tiles
   */
  get tiles(): any[] {
    return this._tiles;
  }

  /**
   * Entry/loading points on a level
   *
   * @prop {object} entries
   */
  get entries(): object {
    return this._entries;
  }

  /**
   * Name reference to tile set image
   *
   * @prop {string} tileSource
   */
  get tileSource(): string {
    return this._tileSource;
  }

  /**
   * Main fixtures of the level
   *
   * @prop {LevelFixtures} fixtures
   */
  get fixtures(): LevelFixture[] {
    return this._fixtures;
  }

  /**
   * Load a single fixture from a layer object
   *
   * @param  {string}      type    Fixture type
   * @param  {any}         fixture Fixture data
   *
   * @return {LevelFixture}        Resulting fixture instance
   */
  private createFixture(type: string, fixture: any): LevelFixture {
    ["x", "y", "width", "height"].forEach((prop) => {
      if (!fixture.hasOwnProperty(prop)) {
        throw new Error(
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
        return new Entry(position, size, fixture);
      case "npc":
        return new NonPlayer(fixture);
      case "enemy":
        let enemy = new Enemy(fixture);
        return enemy.defeated ? null : enemy;
      case "item":
        let item = new Item(position, size, fixture);
        return item.obtained ? null : item;
      default:
        throw new Error(`Unable to create fixture for object type "${type}".`);
    }
  }

  /**
   * Get the value of a custom property from template data
   *
   * @param  {object} template Level data
   * @param  {string} property Property name to locate
   *
   * @return {mixed}           Property's value
   */
  private getJsonProperty(json: any, property: string): string {
    let properties = json.properties ?? [];

    return properties
      .filter((prop) => prop.name === property)
      .map((prop) => prop.value)[0];
  }

  /**
   * Get the tile layers from the level data
   *
   * @param  {object[]} layers Layer data
   *
   * @return {object}          Tile layers
   */
  private getTileLayers(layers: any[]): object[] {
    return layers.filter((l) => l.type === "tilelayer");
  }

  /**
   * Get the object groups from the level data
   *
   * @param  {object[]} layers Layer data
   *
   * @return {object}          Object groups
   */
  private getObjectGroups(layers: any[]): any {
    let objectGroups: any = {};

    layers.filter((l) => {
      if (l.type !== "objectgroup") {
        return;
      }

      if (objectGroups[l.name]) {
        throw new Error(`Duplicate name for object layers: ${l.name}`);
      }

      objectGroups[l.name] = l;
    });

    return objectGroups;
  }
}

export default LevelTemplate;
