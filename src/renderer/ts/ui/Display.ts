import Game from "@/Game";
import Vector from "@common/Vector";
import { bus } from "@/EventBus";
import { CallableMap } from "@/interfaces";

/**
 * Different modes for rendering the display
 *
 * In static mode, entites render relative to a (0,0) origin point.
 * In dynamic mode, entites render relative to another entity. e.g. the player
 */
enum RenderMode {
  Static,
  Dynamic,
}

class Display {
  /**
   * Main rendering context
   */
  private ctx: CanvasRenderingContext2D;

  /**
   * Height of the display
   */
  private height: number;

  /**
   * Width of the display
   */
  private width: number;

  /**
   * Whether the contents of the display move dependently on a center point
   */
  private renderMode: RenderMode;

  /**
   * Create a new display instance
   *
   * @param aspectRatio - height and width of the display
   * @param canvas      - HTML canvas element
   * @param game        - underlying game instance
   */
  constructor(
    private aspectRatio: Vector,
    canvas: HTMLCanvasElement,
    private game: Game
  ) {
    this.width = aspectRatio.x;
    this.height = aspectRatio.y;

    this.renderMode = RenderMode.Dynamic;

    this.ctx = canvas.getContext("2d");

    this.resizetoWindow();

    bus.register(this);
  }

  /**
   * The drawing offset relative to the current render mode
   */
  get offset(): Vector {
    if (this.renderMode === RenderMode.Static) {
      return new Vector(0, 0);
    }

    const center = this.game.renderPoint;

    return new Vector(this.width / 2 - center.x, this.height / 2 - center.y);
  }

  /**
   * The current resolution
   */
  get resolution() {
    return new Vector(this.width, this.height);
  }

  /**
   * Hand off to game instance for drawing.
   */
  public draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.game.draw(this.ctx, this.offset, this.resolution);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      resize: (_: Event) => this.resizetoWindow(),
      "battle.start": (_: CustomEvent) => (this.renderMode = RenderMode.Static),
      "battle.end": (_: CustomEvent) => (this.renderMode = RenderMode.Dynamic),
    };
  }

  /**
   * Determine if a canvas resize is imminent based on window's width
   */
  private resizetoWindow(): void {
    // Does the view port fit a full-width render?
    if (window.innerWidth >= this.aspectRatio.x) {
      return this.resizeCanvases();
    }

    const ratio: number = this.height / this.width;
    let width: number = Math.floor(window.innerWidth);
    let height: number = Math.floor(window.innerWidth * ratio);

    if (width % 2 === 1) {
      width--;
    }

    if (height % 2 === 1) {
      height--;
    }

    this.resizeCanvases(width, height);
  }

  /**
   * Resize context canvas to a new size
   *
   * @param width  - new canvas width
   * @param height - new canvas height
   */
  private resizeCanvases(
    width: number = this.aspectRatio.x,
    height: number = this.aspectRatio.y
  ): void {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
    this.ctx.imageSmoothingEnabled = false;

    this.width = width;
    this.height = height;
  }
}

export default Display;
