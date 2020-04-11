import Vector from "./Vector";

/**
 * Drawables are elements that can render on a canvas
 *
 * @interface
 */
export interface Drawable {
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector): void;
}

/**
 * Eventful interfaces are characterized by their register method, a hook into
 * the their underlying instance which allows an event bus to easily register
 * all of their events.
 *
 * @interface
 */
export interface Eventful {
  register(): object | object[];
}

/**
 * Lockables can be disabled to prevent their default behavior from happening
 *
 * @interface
 */
export interface Lockable {
  locked: boolean;

  lock(): boolean;

  unlock(): boolean;
}
