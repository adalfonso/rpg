import npcs from "./npcs.json";
import BaseActor from "./BaseActor";
import Vector from "../Vector";
import Dialogue from "../Dialogue";
import { bus } from "../app";
import Player from "./Player.js";
import Eventful from "../Eventful";
import Drawable from "../Drawable";

export default class NPC extends BaseActor implements Eventful, Drawable {
  protected name: string;
  protected data: any;
  protected dialogue: Dialogue;
  protected playerRef: Player;

  constructor(obj, player: Player) {
    super(new Vector(obj.x, obj.y), new Vector(obj.width, obj.height));

    let name = obj.properties.filter((prop) => prop.name === "name")[0].value;

    let npc = npcs[name];

    if (!npc) {
      throw new Error("NPC data for " + name + " is not defined in npcs.json");
    }

    this.name = name;
    this.data = npc;
    this.dialogue = null;
    this.playerRef = player;

    bus.register(this);
  }

  get dialogueName(): string {
    return this.data.display_name;
  }

  speak() {
    if (this.dialogue || !this.collidesWith(this.playerRef)) {
      return;
    }

    this.dialogue = new Dialogue(this.data.default.speech, this, [
      this.playerRef,
    ]);
  }

  update(dt: number) {
    if (this.dialogue && this.dialogue.done) {
      this.dialogue = null;
    } else if (this.dialogue) {
      this.dialogue.update(dt);
    }
  }

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {
    if (this.dialogue) {
      this.dialogue.draw(ctx, offset, resolution);
    }
  }

  register(): object {
    return {
      keyup: (e) => {
        if (e.key === " " || e.key === "Enter") {
          this.speak();
        }
      },
    };
  }
}
