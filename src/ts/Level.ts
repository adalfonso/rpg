import Clip from "./inanimates/Clip";
import Enemy from "./actors/Enemy";
import Entry from "./inanimates/Entry";
import Map from "./inanimates/Map";
import NPC from "./actors/NPC";
import Player from "./actors/Player";
import Portal from "./inanimates/Portal";
import Vector from "./Vector";
import config from "./config";
import tileset from "@img/dungeon_sheet.png";
import { Drawable } from "./interfaces";
import { bus } from "./app";
import levels from "./levels/levels";

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
   * Entry points that an entity has to the level
   * TODO: Better solution for typing these
   *
   * @prop {any} entries
   */
  private entries: any;

  /**
   * A mix of entities that interact in the level
   * TODO: Better solution for typing these
   *
   * @prop {any[]} entities
   */
  private entities: any[] = [];

  /**
   * Create a new level instance
   *
   * @param {object} template Object loaded from json containing level data
   * @param {Player} player   Main player instance
   */
  constructor(template, player: Player) {
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

    [this.player, ...this.entities].forEach((entity) => {
      entity.update(dt);

      if (entity instanceof Enemy && entity.collidesWith(this.player)) {
        entity.fight(this.player);
      }

      if (entity instanceof Clip) {
        let collision = this.player.collidesWith(entity);

        if (collision) {
          this.player.backstep(collision);
        }
      }

      if (entity instanceof Portal) {
        let collision = this.player.collidesWith(entity);

        if (collision) {
          events.push({
            type: "enter_portal",
            ref: entity,
          });
        }
      }
    });

    // TODO: Fix potential bug where running this.load() on the first event
    // wipes out level fixtures that are referenced on later events.
    events.forEach((event) => {
      if ((event.type = "enter_portal")) {
        let match = event.ref.to.match(/^(\d+)\.(\d+)$/);
        let level = levels[parseInt(match[1])][parseInt(match[2])];
        this.load(level, event.ref);
      }
    });
  }

  /**
   * Draw map and level entities
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

    [this.player, ...this.entities].forEach((entity) => {
      entity.draw(ctx, offset, resolution);
    });
  }

  /**
   * Load a level template. If there is a referenced portal, move player to
   * corresponding entry point.
   *
   * @param {LevelData} template Level details json
   * @param {Portal}    portal   Starting portal
   */
  public load(template, portal?: Portal) {
    this.cleanup();

    this.map = new Map(
      template.layers.filter((layer) => layer.type === "tilelayer"),
      tileset
    );

    template.layers
      .filter((layer) => layer.type === "objectgroup")
      .forEach((layer) => {
        layer.objects.forEach((entity) => this.loadEntity(layer.name, entity));
      });

    let entry = portal ? this.entries[portal.from] : this.entries.origin;

    // Relocate player when level is loaded
    this.player.pos = entry.pos;
  }

  /**
   * Clean up residual data from previous level
   */
  private cleanup() {
    // Remove event listeners from NPC
    // TODO: Tie this to an interface because there might be more Eventful
    // resources to cause memory leaks.

    this.entities
      .filter((e) => e instanceof NPC)
      .forEach((e) => bus.unregister(e));

    this.entities = [];
    this.entries = {};
  }

  /**
   * Load a single entity from the layer
   *
   * @param {string} layer  Layer name
   * @param {any}    entity Entity data
   */
  private loadEntity(layer: string, entity: any) {
    let pos = new Vector(entity.x, entity.y).times(config.scale);
    let size = new Vector(entity.width, entity.height).times(config.scale);

    switch (layer) {
      case "clip":
        this.entities.push(new Clip(pos, size));
        break;
      case "portal":
        this.entities.push(new Portal(pos, size, entity));
        break;
      case "entry":
        this.entries[entity.name] = new Entry(pos, size, entity);
        break;
      case "npc":
        this.entities.push(new NPC(entity, this.player));
        break;
      case "enemy":
        this.entities.push(new Enemy(entity));
        break;
    }
  }
}

export default Level;
