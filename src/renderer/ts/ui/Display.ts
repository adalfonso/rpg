import Game from "@/Game";
import Vector from "@common/Vector";
import { bus } from "@/EventBus";

/**
 * Different modes for rendering the display
 *
 * In static mode, entites render relative to a (0,0) origin point.
 * In dynamic mode, entites render relative to another entity. e.g. the player
 *
 * @enum {RenderMode} RenderMode
 */
enum RenderMode {
  Static,
  Dynamic,
}

class Display {
  /**
   * Main game instance
   *
   * @prop {Game} game
   */
  private game: Game;

  /**
   * Main rendering context
   *
   * @prop {CanvasRenderingContext2D} ctx
   */
  private ctx: CanvasRenderingContext2D;

  /**
   * Original width/height of display
   *
   * @prop {Vector} aspectRatio
   */
  private aspectRatio: Vector;

  /**
   * Height of the display
   *
   * @prop {number} height
   */
  private height: number;

  /**
   * Width of the display
   *
   * @prop {number} width
   */
  private width: number;

  /**
   * Whether the contents of the display move dependently on a center point
   *
   * @prop {RenderMode} renderMode;
   */
  private renderMode: RenderMode;

  /**
   * Create a new display instance
   *
   * @param {Vector}            aspectRatio Height and width of the display
   * @param {HTMLCanvasElement} canvas       HTML canvas element
   * @param {Game}              game       Underlying game instance
   */
  constructor(aspectRatio: Vector, canvas: HTMLCanvasElement, game: Game) {
    this.aspectRatio = aspectRatio;
    this.width = aspectRatio.x;
    this.height = aspectRatio.y;
    this.game = game;

    this.renderMode = RenderMode.Dynamic;

    this.ctx = canvas.getContext("2d");

    this.resizetoWindow();

    bus.register(this);
  }

  /**
   * The drawing offset relative to the current render mode
   *
   * @prop {Vector} offset
   */
  get offset(): Vector {
    if (this.renderMode === RenderMode.Static) {
      return new Vector(0, 0);
    }

    let center = this.game.renderPoint;

    return new Vector(this.width / 2 - center.x, this.height / 2 - center.y);
  }

  /**
   * The current resolution
   *
   * @prop {Vector} resolution
   */
  get resolution() {
    return new Vector(this.width, this.height);
  }

  /**
   * Hand off to game instance for drawing.
   */
  public draw() {
    let offset = this.offset;

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.translate(offset.x, offset.y);

    this.game.draw(this.ctx, offset, this.resolution);

    this.ctx.translate(-offset.x, -offset.y);
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  public register(): object {
    return {
      resize: (e) => this.resizetoWindow(),
      "battle.start": (e) => (this.renderMode = RenderMode.Static),
      "battle.end": (e) => (this.renderMode = RenderMode.Dynamic),
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

    let ratio: number = this.height / this.width;
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
   * @param {number} width  New canvas width
   * @param {number} height New canvas height
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
