import * as ex from "excalibur";
import { DrawStrategy } from "@/interfaces";

/**
 * For all your ad hoc 2D canvas drawing
 *
 * This is needed to make the old drawing routine from this game compatible with
 * excalibur's webgl canvas. Draw 2D is allegedly less efficient, so this ad hoc
 * concept may be temporary.
 *
 * Due to the nature of excalibur's canvas we have to store some of the
 * rendering info/logic as members on the class so it can persist until the 2D
 * ctx is provided.
 */
export class AdHocCanvas {
  /** Current rendering resolution */
  private _render_resolution = ex.Vector.Zero;

  /** Ad hoc canvas for manual rendering */
  private _canvas_2d: ex.Canvas;

  /** Handles the actual drawing logic */
  private _strategy: DrawStrategy = () => {};

  constructor() {
    this._canvas_2d = new ex.Canvas({ draw: this._draw.bind(this) });
  }

  /**
   * Public-facing draw
   *
   * Set drawing info/logic locally each time
   *
   * @param ctx - excalibur render context
   * @param resolution - screen resolution
   * @param draw_strategy - drawing logic
   */
  public draw(
    ctx: ex.ExcaliburGraphicsContext,
    resolution: ex.Vector,
    draw_strategy: DrawStrategy
  ) {
    this._render_resolution = resolution;
    this._strategy = draw_strategy;
    this._canvas_2d.width = resolution.x;
    this._canvas_2d.height = resolution.y;
    this._canvas_2d.draw(ctx, 0, 0);
  }

  /**
   * Execute the draw strategy
   *
   * @param ctx - 2D render context
   */
  private _draw(ctx: CanvasRenderingContext2D) {
    this._strategy(ctx, this._render_resolution);
  }
}
