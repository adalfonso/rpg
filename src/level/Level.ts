import CollisionHandler from "@/physics/CollisionHandler";
import Entry from "@/inanimate/Entry";
import Map from "@/inanimate/Map";
import MissingDataError from "@/error/MissingDataError";
import Portal from "@/inanimate/Portal";
import { Drawable, Eventful } from "@/interfaces";
import { LevelFixture } from "./LevelFixture";
import { LevelFixtureFactory } from "./LevelFixtureFactory";
import { LevelTemplate } from "./LevelTemplate";
import { NonPlayer } from "@/actor/NonPlayer";
import { Nullable } from "@/types";
import { Player } from "@/actor/Player";
import { Vector } from "excalibur";
import { bus, EventType } from "@/event/EventBus";
import { getImagePath } from "@/util";
import { getLevels } from "./levels";

/**
 * A discrete area of the game
 *
 * Level contains actors, a renderable map, and other fixtures.
 *
 * Level is reusable, for better or for worse. It simply loads a decoded json
 * string into memory when a new area is entered.
 */
class Level implements Drawable {
  /** World area associated with the level */
  private _map: Nullable<Map> = null;

  /** Entry points that an fixture has to the level */
  private _entries: Record<string, Entry> = {};

  /** A mix of fixtures that interact in the level */
  private _fixtures: LevelFixture[] = [];

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
    this._fixtures.forEach((fixture) => {
      if (fixture instanceof NonPlayer && fixture.isExpired) {
        this.removeFixture(fixture);
      }
    });

    this._fixtures.forEach((fixture) => fixture.update(dt));

    // Remove any stale fixtures that are returned
    this.collisionHandler.update(dt).forEach((fixture) => {
      this.removeFixture(fixture);
    });

    // Reload fixtures incase any have been recently removed
    this.collisionHandler.loadFixtures(this._fixtures);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Custom]: {
        "portal.enter": (e: CustomEvent) => {
          const portal = e.detail?.portal;

          if (!portal) {
            throw new MissingDataError(
              `Could not find portal during "portal.enter" event as observed by "Level".`
            );
          }

          const to = portal?.to;
          const level = getLevels()[to];

          if (!level) {
            throw new MissingDataError(
              `Unable to locate level json for "${to}".`
            );
          }

          this.load(
            new LevelTemplate(level, new LevelFixtureFactory()),
            portal
          );
        },
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
    if (!this._map) {
      throw new MissingDataError(`Cannot draw level when map is not set`);
    }

    this._map.draw(ctx, offset, resolution);

    [this.player, ...this._fixtures].forEach((fixture) =>
      fixture.draw(ctx, offset, resolution)
    );
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

    const tileSet = getImagePath(`tileset.${template.tileSource}`);

    this._map = new Map(template.tiles, tileSet);

    this._entries = template.entries;
    this._fixtures = template.fixtures;
    this.collisionHandler.loadFixtures(template.fixtures);

    const entry: Entry = portal
      ? this._entries[portal.from]
      : this._entries.origin;

    if (!entry) {
      throw new MissingDataError(
        "Unable to find origin entry point when loading player onto map."
      );
    }

    // Relocate player when level is loaded
    this.player.moveTo(entry.position);
  }

  /** Clean up residual data from previous level */
  private cleanup() {
    /**
     * Force unregister every fixture, even if they aren't really eventful to
     * prevent memory leaks.
     */
    this._fixtures.forEach((e) => bus.unregister(e as Eventful));
    this._fixtures = [];
    this._entries = {};
  }

  /**
   * Remove a fixture
   *
   * @param fixture - fixture to remove
   */
  private removeFixture(fixture: LevelFixture) {
    this._fixtures = this._fixtures.filter((f) => f !== fixture);
  }
}

export default Level;
