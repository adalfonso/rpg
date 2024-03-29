import { Vector } from "excalibur";
import { Animation, AnimationType } from "../Animation";

/** Required options for rendering an animation */
type RenderOptions = {
  fillStyle?: string;
  font?: string;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
};

/** Manages text and renders it according to a set of options */
export class AnimatedText {
  /**
   * Create a new AnimatedText instance
   *
   * @param _text      - text content
   * @param _animation - current animation applied to the text
   * @param _position  - starting position of the text
   * @param _options   - render options
   */
  constructor(
    private _text: string,
    private _animation: Animation,
    private _position: Vector,
    private _options: RenderOptions
  ) {}

  /** If the animation is done */
  get isDone(): boolean {
    return this._animation.isDone;
  }

  /**
   * Update the animation
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    if (this.isDone) {
      return;
    }

    const { type, delta } = this._animation.update(dt);

    // only handles position animations for now
    if (type !== AnimationType.Position) {
      return;
    }

    this.move(delta);
  }

  /**
   * Draw renderable text
   *
   * @param ctx - render context

   * @param _resolution - render resolution
   */
  public draw2D(ctx: CanvasRenderingContext2D, _resolution: Vector) {
    const options = this._options;

    ctx.save();

    for (const option in options) {
      ctx[option] = options[option];
    }

    ctx.fillText(this._text, this._position.x, this._position.y);

    ctx.restore();
  }

  /**
   * Change the text's position
   *
   * @param delta - text's new position change
   */
  private move(delta: Vector) {
    this._position = this._position.add(delta);
  }
}
