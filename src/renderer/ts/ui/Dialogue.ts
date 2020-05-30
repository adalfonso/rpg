import Actor from "../actors/Actor";
import TextStream from "./TextStream";
import Vector from "@common/Vector";
import { Drawable, Eventful, CallableMap } from "../interfaces";
import { bus } from "@/EventBus";

class Dialogue implements Eventful, Drawable {
  /**
   * If waiting for user input
   */
  private waiting: boolean;

  /**
   * Done denotes that all texts have been fully rendered
   */
  public done: boolean;

  /**
   * The length of time in milliseconds between the rendering of each letter
   */
  private frameLength: number;

  /**
   * A bank of how many seconds have passed since the last rendering
   */
  private timeStore: number;

  /**
   * Create a new Dialogue instance
   *
   * @param stream  - stores text used for render
   * @param speaker - actor speaking the dialogue
   * @param actors  - all actors in dialogue, excluding the speaker
   */
  constructor(
    private stream: TextStream,
    private speaker: Actor,
    private actors: Actor[]
  ) {
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
   * @param dt - delta time
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
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector = new Vector(0, 0),
    resolution: Vector
  ) {
    let margin = new Vector(20, 20);
    let size = new Vector(resolution.x - 2 * margin.x, 130);

    let position = new Vector(margin.x, resolution.y - size.y - margin.y).plus(
      offset
    );

    ctx.save();
    ctx.fillStyle = "#EEE";
    ctx.fillRect(position.x, position.y, size.x, size.y);

    this.drawText(ctx, position, resolution.minus(margin.times(2)));

    ctx.restore();
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
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
   * @param e - keyboard event
   */
  private next(e: KeyboardEvent) {
    if (!this.waiting || this.done) {
      return;
    }

    if (this.stream.isDone) {
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
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  private drawText(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    let lineHeight = 52;
    let padding = new Vector(20, 20);

    ctx.font = "32px Minecraftia";
    ctx.textAlign = "left";

    // Reset text stream on first render
    if (this.stream.isEmpty) {
      let prefix = this.speaker ? this.speaker.displayAs + ": " : "";

      this.stream.fillBuffer(ctx, resolution.minus(padding.times(2)), prefix);
    }

    ctx.fillStyle = "#333";
    ctx.font = "32px Minecraftia";
    ctx.textAlign = "left";

    let lines = this.stream.read();
    let fragment = this.stream.fragment;

    // Print each line in the buffer
    for (let i = 0; i < lines.length; i++) {
      const text = fragment.length < lines[i].length ? fragment : lines[i];
      const lineOffset = new Vector(0, lineHeight).times(i + 1);
      const position = offset.plus(padding).plus(lineOffset);

      ctx.fillText(text.trim(), position.x, position.y);

      fragment = fragment.substr(text.length);
    }
  }
}

export default Dialogue;
