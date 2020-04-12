import Actor from "./Actor";
import Dialogue from "@/Dialogue";
import Player from "./Player.js";
import Vector from "@/Vector";
import npcs from "./npcs.json";
import { Drawable, Eventful } from "@/interfaces";
import { bus } from "@/app";

class NPC extends Actor implements Eventful, Drawable {
  protected name: string;
  protected data: any;
  protected dialogue: Dialogue;
  protected playerRef: Player;

  constructor(obj, player: Player) {
    super(new Vector(obj.x, obj.y), new Vector(obj.width, obj.height));

    let name = obj.name;

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

export default NPC;
