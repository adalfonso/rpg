import Vector from "./Vector";

export default interface Drawable {
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector): void;
}
