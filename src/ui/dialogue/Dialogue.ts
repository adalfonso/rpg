import * as ex from "excalibur";
import TextStream from "./TextStream";
import { Actor } from "@/actor/Actor";
import { ExcaliburGraphicsContext } from "excalibur";
import { Nullable } from "@/types";
import { bus, EventType } from "@/event/EventBus";

export class Dialogue {
  /** If waiting for user input */
  private waiting: boolean;

  /** The length of time in milliseconds between the rendering of each letter */
  private frameLength: number;

  /** A bank of how many seconds have passed since the last rendering */
  private timeStore: number;

  private _canvas: ex.Canvas;

  // TODO : does this need to be a member
  private _resolution = ex.Vector.Zero;

  /**
   * Create a new Dialogue instance
   *
   * @param stream  - stores text used for render
   * @param _speaker - actor speaking the dialogue
   * @param actors  - all actors in dialogue, excluding the speaker
   */
  constructor(
    private stream: TextStream,
    private _speaker: Nullable<Actor>,
    private actors: Actor[]
  ) {
    this.waiting = false;

    this.frameLength = 1000 / 24;
    this.timeStore = 0;

    if (this._speaker) {
      this.actors = [...this.actors, this._speaker];
    }

    this._canvas = new ex.Canvas({ draw: this._draw.bind(this) });

    this.start();
  }

  get speaker() {
    return this._speaker;
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

    const frames = Math.floor(this.timeStore / this.frameLength);

    this.waiting = this.stream.tick(frames);
    this.timeStore = this.timeStore % this.frameLength;
  }

  /**
   * Public method to draw Dialogue and all underlying entities
   *
   * @param ectx - excalibur rendering context
   * @param resolution - render resolution for canvas
   */
  public draw(ectx: ExcaliburGraphicsContext, resolution: ex.Vector) {
    this._resolution = resolution;
    this._canvas.width = resolution.x;
    this._canvas.height = resolution.y;

    this._canvas.draw(ectx, 0, 0);
  }

  /**
   * Draw Dialogue and all underlying entities
   *
   * @param ectx - excalibur rendering context
   */
  private _draw(ctx: CanvasRenderingContext2D) {
    const resolution = this._resolution;
    const margin = new ex.Vector(20, 20);
    const size = new ex.Vector(resolution.x - 2 * margin.x, 130);
    const position = new ex.Vector(margin.x, resolution.y - size.y - margin.y);

    ctx.save();
    ctx.fillStyle = "#EEE";
    ctx.fillRect(position.x, position.y, size.x, size.y);
    this.drawText(ctx, position, resolution.sub(margin.scale(2)));
    ctx.restore();
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Keyboard]: {
        keyup: (e: KeyboardEvent) => {
          if (e.key === "Enter") {
            this.next(e);
          }

          if (this.isDone) {
            this.stop();
          }
        },
      },
    };
  }

  /** If the dialogue is done rendering */
  get isDone() {
    return this.stream.isDone && !this.waiting;
  }

  /** Begin the dialogue */
  private start() {
    this.actors.forEach((a) => {
      a.in_dialogue = true;
      a.lock();
    });

    bus.register(this);
  }

  /** End the dialogue */
  private stop() {
    this.actors.forEach((a) => {
      a.in_dialogue = false;
      a.unlock();
    });

    bus.unregister(this);
  }

  /**
   * Move to the next line of text or end the dialogue
   *
   * @param e - keyboard event
   */
  private next(_e: KeyboardEvent) {
    if (!this.waiting) {
      return;
    }

    this.waiting = false;

    if (this.stream.isDone) {
      return;
    }

    this.stream.next();
    this.timeStore = 0;
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
    offset: ex.Vector,
    resolution: ex.Vector
  ) {
    const lineHeight = 52;
    const padding = new ex.Vector(20, 20);

    ctx.font = "32px Minecraftia";
    ctx.textAlign = "left";

    // Reset text stream on first render
    if (this.stream.isEmpty) {
      const prefix = this._speaker ? this._speaker.displayAs + ": " : "";

      this.stream.fillBuffer(ctx, resolution.sub(padding.scale(2)), prefix);
    }

    ctx.fillStyle = "#333";
    ctx.font = "32px Minecraftia";
    ctx.textAlign = "left";

    const lines = this.stream.read();
    let fragment = this.stream.fragment;

    // Print each line in the buffer
    for (let i = 0; i < lines.length; i++) {
      const text = fragment.length < lines[i].length ? fragment : lines[i];
      const lineOffset = new ex.Vector(0, lineHeight).scale(i + 1);
      const position = offset.add(padding).add(lineOffset);

      ctx.fillText(text.trim(), position.x, position.y);

      fragment = fragment.substr(text.length);
    }
  }
}
