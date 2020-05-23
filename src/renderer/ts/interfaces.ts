import Vector from "@common/Vector";

/**
 * Drawables are elements that can render on a canvas
 *
 * @interface
 */
export interface Drawable {
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector): void;
}

/**
 * A map of callables
 */
export type CallableMap = { [key: string]: Function };

/**
 * Eventful interfaces are characterized by their register method, a hook into
 * the their underlying instance which allows an event bus to easily register
 * all of their events.
 *
 * @interface
 */
export interface Eventful {
  register(): CallableMap;
}

/**
 * Lockables can be disabled to prevent their default behavior from happening
 *
 * @interface
 */
export interface Lockable {
  lock(): boolean;

  unlock(): boolean;
}
