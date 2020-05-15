import Vector from "@common/Vector";
import config from "./config";
import { Drawable } from "./interfaces";

/**
 * Data fed to a Renderable instance
 *
 * @type {RenderData}
 */
export type RenderData = {
  fps: number;
  ratio: Vector;
  scale: number;
  sprite: string;
};

export default class Renderable implements Drawable {
  /**
   * Image element to render
   *
   * @prop {HTMLImageElement} img
   */
  private img: HTMLImageElement;

  /**
   * Current frame in animation sequence
   *
   * @prop {number} frame
   */
  public frame: number;

  /**
   * Starting frame in animation sequence
   *
   * @prop {number} startFrame
   */
  private startFrame: number;

  /**
   * Total number of frames in animation sequence
   *
   * @prop {number} frameCount
   */
  private frameCount: number;

  /**
   * Vector of columns/rows in animation sequence
   *
   * @prop {number} gridRatio
   */
  private gridRatio: Vector;

  /**
   * Unix time at which the next animation frame should render
   *
   * @prop {number} nextAnimationTimestamp
   */
  private nextAnimationTimestamp: number;

  /**
   * Number of frames to render in a second
   *
   * @prop {number} fps
   */
  private fps: number;

  /**
   * Scale at which to render the image
   *
   * @prop {number} scale
   */
  public scale: number;

  /**
   * Size of sub-panel in the sprite sheet - the effective dimensions of sprite
   *
   * @prop {number} spriteSize
   */
  public spriteSize: Vector;

  /**
   * If the image has loaded. This is needed because HTMLImageElement.complete
   * is set before the onload event takes place.
   *
   */
  public ready: boolean = false;

  /**
   * Create a new Renderable instance
   *
   * @param {string} src        Source path of image element to render
   * @param {number} scale      Scale at which to render the image
   * @param {number} startFrame Starting frame in animation sequence
   * @param {number} frameCount Total number of frames in animation sequence
   * @param {number} gridRatio  Vector of columns/rows in animation sequence
   * @param {number} fps        Number of frames to render in a second
   */
  constructor(
    src: string,
    scale: number = config.scale,
    startFrame: number = 0,
    frameCount: number = 9,
    gridRatio: Vector = new Vector(9, 4),
    fps: number = 10
  ) {
    this.img = new Image();
    this.img.src = src;
    this.scale = scale;
    this.frame = startFrame;
    this.startFrame = startFrame;
    this.frameCount = frameCount;
    this.gridRatio = gridRatio;
    this.fps = fps;
    this.nextAnimationTimestamp = new Date().getTime();

    this.img.onload = () => {
      this.spriteSize = new Vector(
        this.img.width / this.gridRatio.x,
        this.img.height / this.gridRatio.y
      );

      this.ready = true;
    };
  }

  /**
   * Render the image
   *
   * @param {CanvasRenderingContext2D} ctx         Render Context
   * @param {Vector}                   offset      Render position offset
   * @param {Vector}                   _resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution?: Vector
  ) {
    if (!this.ready) {
      return;
    }

    let now = new Date().getTime();

    // Move to the next frame
    if (now >= this.nextAnimationTimestamp) {
      this.frame++;
      this.nextAnimationTimestamp = now + 1000 / this.fps;
    }

    // Reset to starting frame
    if (this.frame >= this.startFrame + this.frameCount) {
      this.frame = this.startFrame;
    }

    let posX: number = (this.frame % this.gridRatio.x) * this.spriteSize.x;
    let posY: number =
      Math.floor(this.frame / this.gridRatio.x) * this.spriteSize.y;

    ctx.drawImage(
      this.img,
      posX,
      posY,
      this.spriteSize.x,
      this.spriteSize.y,
      offset.x,
      offset.y,
      this.spriteSize.x * this.scale,
      this.spriteSize.y * this.scale
    );
  }
}
