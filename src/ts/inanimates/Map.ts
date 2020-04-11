import Enemy from "@/actors/Enemy";
import NPC from "@/actors/NPC";
import Player from "@/actors/Player";
import PlayerClip from "./PlayerClip";
import Portal from "./Portal";
import Renderable from "@/Renderable";
import Vector from "../Vector";
import config from "@/config";
import { bus } from "@/app";

export default class Map {
  protected config: object;
  protected data: any;
  protected player: Player;
  protected playerClips: PlayerClip[];
  protected portals: Portal[];
  protected pos: Vector;
  protected renderable: Renderable;
  protected scale: number;
  public enemies: Enemy[];
  public npcs: NPC[];
  public playerStarts: object;

  constructor(data: object, img: string, player: Player) {
    this.data = data;
    this.player = player;
    this.pos = new Vector(0, 0);
    this.scale = config.scale;
    this.config = {};

    this.renderable = new Renderable(
      img,
      this.scale,
      0,
      240,
      new Vector(24, 10),
      0
    );

    this.playerClips = [];
    this.portals = [];
    this.npcs = [];
    this.enemies = [];
    this.playerStarts = {};

    this.data.layers.forEach((layer) => {
      if (layer.type !== "objectgroup") {
        return;
      }

      layer.objects.forEach((obj) => {
        let pos: Vector = new Vector(obj.x * this.scale, obj.y * this.scale);
        let size: Vector = new Vector(
          obj.width * this.scale,
          obj.height * this.scale
        );
        let match: boolean = layer.name.match(/^player_start_(\d+\.\d+)$/);

        if (layer.name === "collision") {
          this.playerClips.push(new PlayerClip(pos, size));
        } else if (layer.name === "portal") {
          this.portals.push(new Portal(pos, size, layer));
        } else if (layer.name === "npcs") {
          this.npcs.push(new NPC(obj, player));
        } else if (layer.name === "enemies") {
          this.enemies.push(new Enemy(obj));
        } else if (layer.name === "config") {
          this.config = obj.properties;
        } else if (match) {
          this.playerStarts[match[1]] = obj;
        }
      });
    });
  }

  update(dt: number) {
    let events = [];

    this.playerClips.forEach((clip: PlayerClip) => {
      let collision = this.player.collidesWith(clip);

      if (collision) {
        this.player.backstep(collision);
      }
    });

    this.portals.forEach((portal: Portal) => {
      let collision = this.player.collidesWith(portal);

      if (collision) {
        events.push({
          type: "enter_portal",
          obj: portal,
        });
      }
    });

    return events;
  }

  draw(ctx: CanvasRenderingContext2D, overPlayer: boolean = false) {
    if (!this.renderable.ready) {
      return;
    }

    this.data.layers.forEach((layer) => {
      if (layer.type !== "tilelayer") {
        return;
      }

      if (overPlayer && layer.name !== "above_player") {
        return;
      }

      if (!overPlayer && layer.name === "above_player") {
        return;
      }

      let r = this.renderable;

      layer.data.forEach((value, index: number) => {
        r.frame = value - 1;

        let tile = new Vector(
          index % layer.width,
          Math.floor(index / layer.width)
        );

        ctx.save();

        ctx.translate(
          ...tile.times(r.spriteSize).times(r.scale).plus(this.pos).toArray()
        );

        r.draw(ctx);

        ctx.restore();
      });
    });
  }

  destruct() {
    this.npcs.forEach((npc) => bus.unregister(npc));
  }
}
