import Clip from "./inanimates/Clip";
import Enemy from "./actors/Enemy";
import Entry from "./inanimates/Entry";
import Item from "./inanimates/Item";
import Map from "./inanimates/Map";
import NonPlayer from "./actors/NonPlayer";
import Player from "./actors/Player";
import Portal from "./inanimates/Portal";
import Template, { LevelFixture } from "./LevelTemplate";
import Vector from "@common/Vector";
import levels from "./levels/levels";
import { Drawable, Eventful } from "./interfaces";
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
   * TODO: Better solution for typing these
   *
   * @prop {LevelFixture[]} fixtures
   */
  private fixtures: LevelFixture[] = [];

  /**
   * Create a new level instance
   *
   * @param {object} template Object loaded from json containing level data
   * @param {Player} player   Main player instance
   */
  constructor(template: Template, player: Player) {
    this.player = player;

    this.load(template);
  }

  /**
   * Update all fixtures of the level
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {
    let events = [];

    // TODO: Look into a adding a method to these classes that interacts with the
    //       player

    // TODO: This is getting out of control. Add some sort of collision handler.
    [this.player, ...this.fixtures].forEach((fixture) => {
      fixture.update(dt);
      let playerCollision = this.player.collidesWith(fixture);

      if (fixture instanceof Enemy && fixture.collidesWith(this.player)) {
        fixture.fight(this.player);
        if (fixture.defeated) {
          this.removeFixture(fixture);
        }
      } else if (fixture instanceof Clip && playerCollision) {
        this.player.backstep(playerCollision);
      } else if (fixture instanceof Portal && playerCollision) {
        events.push({
          type: "enter_portal",
          ref: fixture,
        });
      } else if (fixture instanceof Item && playerCollision) {
        bus.emit("item.obtain", { item: fixture });
        fixture.obtain();
        this.removeFixture(fixture);
      }
    });

    // TODO: Fix potential bug where running this.load() on the first event
    //       wipes out level fixtures that are referenced on later events.
    events.forEach((event) => {
      if ((event.type = "enter_portal")) {
        let level = levels[event.ref.to];

        if (!level) {
          throw new Error(`Unable to locate level json for "${event.ref.to}".`);
        }

        this.load(new Template(level), event.ref);
      }
    });
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
    this.map.draw(ctx);

    [this.player, ...this.fixtures].forEach((fixture) => {
      fixture.draw(ctx, offset, resolution);
    });
  }

  /**
   * Load a level template. If there is a referenced portal, move player to
   * corresponding entry point.
   *
   * @param {Template} template Level details json
   * @param {Portal}   portal   Starting portal
   */
  public load(template: Template, portal?: Portal) {
    this.cleanup();

    let tileSet = getImagePath(`tileset.${template.tileSource}`);

    this.map = new Map(template.tiles, tileSet);

    this.entries = template.entries;
    this.fixtures = template.fixtures;

    let entry: Entry = portal ? this.entries[portal.from] : this.entries.origin;

    if (!entry) {
      throw new Error(
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
    // Remove event listeners from non-players

    // TODO: Tie this to an interface because there might be more Eventful
    //       resources to cause memory leaks.
    this.fixtures
      .filter((e) => e instanceof NonPlayer)
      .forEach((e) => bus.unregister(<Eventful>e));

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
