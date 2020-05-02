import Actor from "../actors/Actor";
import TextStream from "./TextStream";
import Vector from "@common/Vector";
import { Drawable, Eventful } from "../interfaces";
import { bus } from "@/EventBus";

class Dialogue implements Eventful, Drawable {
  /**
   * Used to split the current text out for a line-by-line rendering
   *
   * @prop {TextStream} stream
   */
  private stream: TextStream;

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
   * A waiting state denotes one line of text as fully rendered and is waiting
   * for user input to render the next line
   *
   * @prop {boolean} waiting
   */
  private waiting: boolean;

  /**
   * Done denotes that all texts have been fully rendered
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
   * Create a new Dialogue instance
   *
   * @param {TextStream} pool    Tool for drawing partial lines in the dialogue
   * @param {Actor}      speaker Actor speaking the dialogue
   * @param {Actor[]}    actors  All actors in dialogue, excluding the speaker
   */
  constructor(stream: TextStream, speaker: Actor, actors: Actor[]) {
    this.stream = stream;
    this.speaker = speaker;
    this.actors = actors;
    this.waiting = false;
    this.done = false;

    this.frameLength = 1000 / 24;
    this.timeStore = 0;

    if (this.speaker) {
      this.actors.push(this.speaker);
    }

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

    let frames = Math.floor(this.timeStore / this.frameLength);

    this.waiting = this.stream.tick(frames);

    this.timeStore = this.timeStore % this.frameLength;
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
    offset: Vector = new Vector(0, 0),
    resolution: Vector
  ) {
    let margin = new Vector(20, 20);
    let size = new Vector(resolution.x - 2 * margin.x, 130);

    let position = new Vector(
      margin.x - offset.x,
      resolution.y - offset.y - size.y - margin.y
    );

    ctx.save();

    ctx.translate(position.x, position.y);
    ctx.fillStyle = "#EEE";
    ctx.fillRect(0, 0, size.x, size.y);

    this.drawText(ctx, new Vector(0, 0), resolution.minus(margin.times(2)));

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

    if (this.stream.isDone()) {
      this.done = true;
    } else {
      this.stream.next();
      this.timeStore = 0;
      this.waiting = false;
    }
  }

  /**
   * Draw text
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  private drawText(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    let lineHeight = 52;
    let padding = new Vector(20, 20);

    ctx.save();

    ctx.font = "32px Minecraftia";
    ctx.textAlign = "left";

    // Reset text stream on first render
    if (this.stream.isEmpty()) {
      let prefix = this.speaker ? this.speaker.dialogueName + ": " : "";

      this.stream.fillBuffer(ctx, resolution.minus(padding.times(2)), prefix);
    }

    ctx.translate(offset.x + padding.x, offset.y + padding.y);
    ctx.fillStyle = "#333";
    ctx.font = "32px Minecraftia";
    ctx.textAlign = "left";

    let lines = this.stream.read();
    let fragment = this.stream.fragment;

    // Print each line in the buffer
    for (let i = 0; i < lines.length; i++) {
      let text = fragment.length < lines[i].length ? fragment : lines[i];

      ctx.translate(0, lineHeight);
      ctx.fillText(text.trim(), 0, 0);

      fragment = fragment.substr(text.length);
    }

    ctx.restore();
  }
}

export default Dialogue;
