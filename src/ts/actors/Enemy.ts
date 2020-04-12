import Actor from "./Actor";
import Dialogue from "@/Dialogue";
import Player from "./Player.js";
import Renderable from "@/Renderable";
import StatsManager from "@/Stats";
import Vector from "@/Vector";
import enemies from "./enemies.json";
import knight from "@img/enemies/knight.png";
import { Drawable } from "@/interfaces";
import { bus } from "@/app";

let sprites = { knight: knight };

class Enemy extends Actor implements Drawable {
  protected data: any;
  protected dialogue: Dialogue;
  protected sprite: Renderable;
  protected sprites: Renderable[];
  protected type: string;
  public defeated: boolean;
  public stats: StatsManager;

  constructor(obj) {
    super(new Vector(obj.x, obj.y), new Vector(obj.width, obj.height));

    let type = obj.type;

    let enemy = enemies[type];

    if (!enemy) {
      throw new Error(
        "Enemy data for " + name + " is not defined in enemies.json"
      );
    }

    this.type = type;
    this.data = enemy;
    this.dialogue = null;
    this.stats = new StatsManager(enemy.default.stats);
    this.defeated = false;

    let sprite = sprites[this.type];

    this.sprites = [
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      new Renderable(sprite, 2, 0, 0, new Vector(1, 4), 8),
      new Renderable(sprite, 2, 3, 0, new Vector(1, 4), 8),
      new Renderable(sprite, 2, 2, 0, new Vector(1, 4), 8),
      new Renderable(sprite, 2, 0, 0, new Vector(1, 4), 8),
      new Renderable(sprite, 2, 1, 0, new Vector(1, 4), 8),
    ];

    this.direction = 4;
  }

  get dialogueName(): string {
    return this.data.display_name;
  }

  fight(player: Player) {
    if (this.defeated) {
      return;
    }

    bus.emit("battle.start", {
      player: player,
      enemy: this,
    });
  }

  update(dt: number) {}

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {
    if (this.defeated) {
      return;
    }

    super.draw(ctx, offset, resolution);

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    this.sprites[this.direction].draw(ctx);

    ctx.restore();
  }
}

export default Enemy;
