import Actor from "./actors/Actor";
import InputHandler from "./EventBus";
import Vector from "./Vector";
import { Drawable, Eventful } from "./interfaces";
import { bus } from "./app";

export default class Dialogue implements Eventful, Drawable {
  protected texts: string[];
  protected speaker: Actor;
  protected actors: Actor[];
  protected currentText: string;

  protected waiting: boolean;
  public done: boolean;

  protected index: number;
  protected frameLength: number;
  protected timeStore: number;

  constructor(texts: string[], speaker: Actor, actors: Actor[]) {
    this.texts = texts;
    this.speaker = speaker;
    this.actors = actors;
    this.currentText = "";

    this.index = 0;
    this.waiting = false;
    this.done = false;

    this.frameLength = 1000 / 24;
    this.timeStore = 0;

    this.actors.push(this.speaker);

    bus.register(this);
    this.start();
  }

  update(dt: number) {
    if (this.waiting) {
      return;
    }

    this.timeStore += dt;

    while (this.timeStore > this.frameLength) {
      this.currentText = this.texts[this.index].substring(
        0,
        this.currentText.length + 1
      );

      this.timeStore -= this.frameLength;
    }

    if (this.currentText === this.texts[this.index]) {
      return (this.waiting = true);
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
    ctx.save();
    ctx.translate(32 - offset.x, 48 - offset.y);
    ctx.font = "30px Arial";
    ctx.fillStyle = "#FFF";

    ctx.fillText(this.speaker.dialogueName + ": " + this.currentText, 0, 0);

    ctx.restore();
  }

  start() {
    this.actors.forEach((a) => {
      a.lock();
      a.inDialogue = true;
    });
  }

  stop() {
    this.actors.forEach((a) => {
      a.inDialogue = false;
      a.unlock();
    });

    bus.unregister(this);
  }

  register(): object {
    return {
      keyup: (e: KeyboardEvent, handler: InputHandler) => {
        if (e.key === "Enter") {
          this.next(e);
        }

        if (this.done) {
          this.stop();
        }
      },
    };
  }

  next(e: KeyboardEvent) {
    if (!this.waiting || this.done) {
      return;
    }

    if (this.index + 1 < this.texts.length) {
      this.index++;
      this.timeStore = 0;
      this.currentText = "";
      this.waiting = false;
    } else {
      this.done = true;
    }
  }
}
