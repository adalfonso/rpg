import Actor from "./actors/Actor";
import InputHandler from "./EventBus";
import Vector from "./Vector";
import { Drawable, Eventful } from "./interfaces";
import { bus } from "./app";

class Dialogue implements Eventful, Drawable {
  /**
   * Listing of all text lines in the dialogue
   *
   * @prop {string[]} texts
   */
  private texts: string[];

  /**
   * Actor speaking the dialogue
   *
   * @prop {Actor} speaker
   */
  private speaker: Actor;

  /**
   * All actors participating in the dialogue
   *
   * @prop {actors[]} actors
   */
  private actors: Actor[];

  /**
   * Text currently output to the screen
   *
   * @prop {string} currentText
   */

  private currentText: string;

  /**
   * Texts index that is currently rendering
   *
   * @prop {number} currentIndex
   */
  private currentIndex: number;

  /**
   * A waiting state denotes one line of text as fully rendered and is waiting
   * for user input to render the next line
   *
   * @prop {boolean} waiting
   */
  private waiting: boolean;

  /**
   * Done denotes that all texts have been full rendered
   *
   * @prop {boolean} done
   */
  public done: boolean;

  /**
   * The length of time in milliseconds between the rendering of each letter
   *
   * @prop {number} frameLength
   */
  private frameLength: number;

  /**
   * A bank of how many seconds have passed since the last rendering
   */
  private timeStore: number;

  /**
   * Create a new dialogue isntance
   *
   * @param {string[]} texts   Listing of all text lines in the dialogue
   * @param {Actor}    speaker Actor speaking the dialogue
   * @param {Actor[]}  actors  All actors in the dialogue, excluding the speaker
   */
  constructor(texts: string[], speaker: Actor, actors: Actor[]) {
    this.texts = texts;
    this.speaker = speaker;
    this.actors = actors;
    this.currentText = "";

    this.currentIndex = 0;
    this.waiting = false;
    this.done = false;

    this.frameLength = 1000 / 24;
    this.timeStore = 0;

    this.actors.push(this.speaker);

    this.start();
  }

  /**
   * Update the current state of the dialogue
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {
    // Waiting for user input, don't update
    if (this.waiting) {
      return;
    }

    this.timeStore += dt;

    if (this.timeStore < this.frameLength) {
      return;
    }

    let endChar =
      Math.min(
        this.texts[this.currentIndex].length,
        Math.floor(this.timeStore / this.frameLength) + this.currentText.length
      ) + 1;

    this.currentText = this.texts[this.currentIndex].substring(0, endChar);

    this.timeStore = this.timeStore % this.frameLength;

    if (this.currentText === this.texts[this.currentIndex]) {
      this.waiting = true;
    }
  }

  /**
   * Draw Dialogue and all underlying entities
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
    ctx.save();
    ctx.translate(32 - offset.x, 48 - offset.y);
    ctx.font = "30px Arial";
    ctx.fillStyle = "#FFF";

    ctx.fillText(this.speaker.dialogueName + ": " + this.currentText, 0, 0);

    ctx.restore();
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  public register(): object {
    return {
      keyup: (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          this.next(e);
        }

        if (this.done) {
          this.stop();
        }
      },
    };
  }

  /**
   * Begin the dialogue
   */
  private start() {
    this.actors.forEach((a) => {
      a.inDialogue = true;
      a.lock();
    });

    bus.register(this);
  }

  /**
   * End the dialogue
   */
  private stop() {
    this.actors.forEach((a) => {
      a.inDialogue = false;
      a.unlock();
    });

    bus.unregister(this);
  }

  /**
   * Move to the next line of text or end the dialogue
   *
   * @param {KeyboardEvent} e Keyboard event
   */
  private next(e: KeyboardEvent) {
    if (!this.waiting || this.done) {
      return;
    }

    if (this.currentIndex + 1 < this.texts.length) {
      this.currentIndex++;
      this.timeStore = 0;
      this.currentText = "";
      this.waiting = false;
    } else {
      this.done = true;
    }
  }
}

export default Dialogue;
