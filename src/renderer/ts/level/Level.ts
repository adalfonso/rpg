import CollisionHandler from "../CollisionHandler";
import Entry from "@/inanimate/Entry";
import Map from "@/inanimate/Map";
import MissingDataError from "@/error/MissingDataError";
import Player from "@/actor/Player";
import Portal from "@/inanimate/Portal";
import Vector from "@common/Vector";
import levels from "./levels";
import { Drawable, Eventful, CallableMap } from "@/interfaces";
import { LevelFixture } from "./LevelFixture";
import { LevelFixtureFactory } from "./LevelFixtureFactory";
import { LevelTemplate } from "./LevelTemplate";
import { bus } from "@/EventBus";
import { getImagePath } from "@/util";

/**
 * A discrete area of the game
 *
 * Level contains actors, a renderable map, and other fixtures.
 *
 * Level is reusable, for better or for worse. It simply loads a decoded json
 * string into memory when a new area is entered.
 */
class Level implements Drawable {
  /**
   * World area associated with the level
   */
  private map: Map;

  /**
   * Entry points that an fixture has to the level
   *
   * TODO: Better solution for typing these
   */
  private entries: any;

  /** A mix of fixtures that interact in the level */
  private fixtures: LevelFixture[] = [];

  /**
   * Create a new level instance
   *
   * @param template - template loaded from level json
   * @param player   - main player instance
   * @param handler  - collision handler for player + fixtures
   */
  constructor(
    template: LevelTemplate,
    private player: Player,
    private collisionHandler: CollisionHandler
  ) {
    this.load(template);
    bus.register(this);
  }

  /**
   * Update all fixtures of the level
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    this.fixtures.forEach((fixture) => fixture.update(dt));

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
   * @return events to register
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

        this.load(new LevelTemplate(level, new LevelFixtureFactory()), portal);
      },
    };
  }

  /**
   * Draw map and level fixtures
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
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
   * Load a level template
   *
   * If there is a referenced portal, move player to corresponding entry point.
   *
   * @param template - level details json
   * @param portal   - starting portal
   *
   * @throws {MissingDataError} when entry is missing
   */
  public load(template: LevelTemplate, portal?: Portal) {
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
    /**
     * Force unregister every fixture, even if they aren't really eventful to
     * prevent memory leaks.
     */
    this.fixtures.forEach((e) => bus.unregister(<Eventful>e));
    this.fixtures = [];
    this.entries = {};
  }

  /**
   * Remove a fixture
   *
   * @param fixture - fixture to remove
   */
  private removeFixture(fixture: LevelFixture) {
    this.fixtures = this.fixtures.filter((f) => f !== fixture);
  }
}

export default Level;
