import CollisionHandler from "./CollisionHandler";
import Entry from "./inanimates/Entry";
import Map from "./inanimates/Map";
import MissingDataError from "./error/MissingDataError";
import Player from "./actors/Player";
import Portal from "./inanimates/Portal";
import Template, { LevelFixture } from "./LevelTemplate";
import Vector from "@common/Vector";
import levels from "./levels/levels";
import { Drawable, Eventful, CallableMap } from "./interfaces";
import { bus } from "@/EventBus";
import { getImagePath } from "@/util";

/**
 * Level represents a discrete area of the game that warrents it's own domain.
 * It contains actors, a renderable map, and other fixtures.
 *
 * Level is reusable, for better or for worse. It simply loads a decoded json
 * string into memory when a new area is entered.
 */
class Level implements Drawable {
  /**
   * Main player instance
   *
   * @prop {Player} player
   */
  private player: Player;

  /**
   * World area associated with the level
   *
   * @prop {Map} map
   */
  private map: Map;

  /**
   * Entry points that an fixture has to the level
   * TODO: Better solution for typing these
   *
   * @prop {any} entries
   */
  private entries: any;

  /**
   * A mix of fixtures that interact in the level
   *
   * @prop {LevelFixture[]} fixtures
   */
  private fixtures: LevelFixture[] = [];

  /**
   * Collision handler for player + fixtures
   *
   * @prop {CollisionHandler} collisionHandler
   */
  private collisionHandler: CollisionHandler;

  /**
   * Create a new level instance
   *
   * @param {object}           template Template loaded from level json
   * @param {Player}           player   Main player instance
   * @param {CollisionHandler} handler  Collision handler
   */
  constructor(template: Template, player: Player, handler: CollisionHandler) {
    this.player = player;
    this.collisionHandler = handler;

    this.load(template);
    bus.register(this);
  }

  /**
   * Update all fixtures of the level
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {
    // Remove any stale fixtures that are returned
    this.collisionHandler.update(dt).forEach((fixture) => {
      this.removeFixture(fixture);
    });

    // Reload fixtures incase any have been recently removed
    this.collisionHandler.loadFixtures(this.fixtures);
  }

  /**
   * Register events with the event bus
   *
   * @return {CallableMap} Events to register
   */
  public register(): CallableMap {
    return {
      "portal.enter": (e: CustomEvent) => {
        let portal = e.detail?.portal;

        if (!portal) {
          throw new MissingDataError(
            `Could not find portal during "portal.enter" event as observed by "Level".`
          );
        }

        let to = portal?.to;
        let level = levels[to];

        if (!level) {
          throw new MissingDataError(
            `Unable to locate level json for "${to}".`
          );
        }

        this.load(new Template(level), portal);
      },
    };
  }

  /**
   * Draw map and level fixtures
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    this.map.draw(ctx, offset, resolution);

    [this.player, ...this.fixtures].forEach((fixture) => {
      fixture.draw(ctx, offset, resolution);
    });
  }

  /**
   * Load a level template. If there is a referenced portal, move player to
   * corresponding entry point.
   *
   * @param  {Template} template Level details json
   * @param  {Portal}   portal   Starting portal
   *
   * @throws {MissingDataError} When entry is missing
   */
  public load(template: Template, portal?: Portal) {
    this.cleanup();

    let tileSet = getImagePath(`tileset.${template.tileSource}`);

    this.map = new Map(template.tiles, tileSet);

    this.entries = template.entries;
    this.fixtures = template.fixtures;
    this.collisionHandler.loadFixtures(template.fixtures);

    let entry: Entry = portal ? this.entries[portal.from] : this.entries.origin;

    if (!entry) {
      throw new MissingDataError(
        "Unable to find origin entry point when loading player onto map."
      );
    }

    // Relocate player when level is loaded
    this.player.moveTo(entry.position);
  }

  /**
   * Clean up residual data from previous level
   */
  private cleanup() {
    // Force unregister every fixture, even if they aren't really eventful to
    // prevent memory leaks.
    this.fixtures.forEach((e) => bus.unregister(<Eventful>e));
    this.fixtures = [];
    this.entries = {};
  }

  /**
   * Remove a fixture
   *
   * @param {LevelFixture} fixture Fixture to remove
   */
  private removeFixture(fixture: LevelFixture) {
    this.fixtures = this.fixtures.filter((f) => f !== fixture);
  }
}

export default Level;
