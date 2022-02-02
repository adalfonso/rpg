import Vector from "@common/Vector";
import config from "@/config";
import { Drawable } from "@/interfaces";

export default class Renderable implements Drawable {
  /**
   * Image element to render
   */
  private img: HTMLImageElement;

  /**
   * Current frame in animation sequence
   */
  public frame: number;

  /**
   * Unix time at which the next animation frame should render
   */
  private nextAnimationTimestamp: number;

  /**
   * Size of sub-panel in the sprite sheet
   *
   * (The effective dimensions of sprite)
   */
  public spriteSize: Vector;

  /**
   * If the image has loaded
   *
   * This is needed because HTMLImageElement.complete is set before the onload
   * event takes place.
   */
  public ready = false;

  /**
   * Create a new Renderable instance
   *
   * @param src        - source path of image element to render
   * @param scale      - scale at which to render the image
   * @param startFrame - starting frame in animation sequence
   * @param frameCount - total number of frames in animation sequence
   * @param gridRatio  - vector of columns/rows in animation sequence
   * @param fps        - number of frames to render in a second
   */
  constructor(
    src: string,
    public scale: number = config.scale,
    private startFrame: number = 0,
    private frameCount: number = 9,
    private gridRatio: Vector = new Vector(9, 4),
    private fps: number = 10
  ) {
    this.img = new Image();
    this.img.src = src;
    this.frame = this.startFrame;
    this.nextAnimationTimestamp = new Date().getTime() + 1000 / this.fps;

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
   * @param ctx         - render context
   * @param offset      - render position offset
   * @param _resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution?: Vector
  ) {
    if (!this.ready) {
      return;
    }

    const now = new Date().getTime();

    // Move to the next frame
    if (now >= this.nextAnimationTimestamp) {
      this.frame++;
      this.nextAnimationTimestamp = now + 1000 / this.fps;
    }

    // Reset to starting frame
    if (this.frame >= this.startFrame + this.frameCount) {
      this.frame = this.startFrame;
    }

    const posX = (this.frame % this.gridRatio.x) * this.spriteSize.x;
    const posY = Math.floor(this.frame / this.gridRatio.x) * this.spriteSize.y;

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
