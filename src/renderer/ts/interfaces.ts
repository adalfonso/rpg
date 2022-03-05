import Vector from "@common/Vector";

/** Any class that renders itself on a canvas */
export interface Drawable {
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector): void;
}

export type Callable<T extends Event> = (e: T) => void;

/** A map of callables */
export type CallableMap<T extends Event> = Record<string, Callable<T>>;

/**
 * Any class that interfaces with an event bus
 *
 * Eventful interfaces are characterized by their register method, a hook into
 * the their underlying instance which allows an event bus to easily register
 * all of their events.
 */
export interface Eventful<T extends Event> {
  register(): CallableMap<T>;
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

/** Any class that can update itself as a function of time */
export interface Updatable {
  update(dt: number): void;
}
