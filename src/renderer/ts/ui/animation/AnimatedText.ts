import Translation from "./Translation";
import Vector from "@common/Vector";

/**
 * Required options for rendering an animation
 */
type RenderOptions = {
  fillStyle?: string;
  font?: string;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
};

/**
 * Manages text and renders it according to a set of options
 */
class AnimatedText {
  /**
   * Current animation applied to the text
   */
  private _animation: Translation;

  /**
   * If the text is currently waiting for an animation
   */
  private _isWaiting: boolean = true;

  /**
   * Create a new AnimatedText instance
   *
   * @param _text     - text content
   * @param _options  - render Options
   * @param _position - starting position of the text
   */
  constructor(
    private _text: string,
    private _options: RenderOptions,
    private _position: Vector = new Vector(9999, 9999)
  ) {}

  /**
   * Determine if the text is waiting for an animation
   */
  get isWaiting(): boolean {
    return this._isWaiting;
  }

  /**
   * Update the animation
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    if (this._isWaiting) {
      return;
    }

    let position = this._animation.update(dt);

    if (this._animation.isDone) {
      this._animation = null;
      this._isWaiting = true;
      return;
    }

    this.moveTo(position);
  }

  /**
   * Draw renderable text
   *
   * @param ctx         - render context
   * @param offset      - render position offset
   * @param _resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution: Vector
  ) {
    let options = this._options;

    ctx.save();

    for (let option in options) {
      ctx[option] = options[option];
    }

    ctx.fillText(
      this._text,
      this._position.x + offset.x,
      this._position.y + offset.y
    );

    ctx.restore();
  }

  /**
   * Apply a new animation to the text
   *
   * @param animation - new animtion
   */
  public applyAnimation(animation: Translation) {
    this._animation = animation;
    this._isWaiting = false;
  }

  /**
   * Change the text's position
   *
   * @param position - text's new position
   */
  private moveTo(position: Vector) {
    this._position = position;
  }
}

export default AnimatedText;
