import Vector from "@common/Vector";

/**
 * Any class that renders itself on a canvas
 */
export interface Drawable {
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector): void;
}

/**
 * A map of callables
 */
export type CallableMap = { [key: string]: Function };

/**
 * Any class that interfaces with an event bus
 *
 * Eventful interfaces are characterized by their register method, a hook into
 * the their underlying instance which allows an event bus to easily register
 * all of their events.
 */
export interface Eventful {
  register(): CallableMap;
}

/**
 * Any class that can be locked/unlocked
 *
 * Lockables can be disabled to prevent their default behavior from happening
 */
export interface Lockable {
  lock(): boolean;

  unlock(): boolean;
}
