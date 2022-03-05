import Vector from "@common/Vector";
import { EventType } from "./EventBus";

/** Any class that renders itself on a canvas */
export interface Drawable {
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector): void;
}

export type Callable<T extends Event> = Record<string, (e: T) => void>;

export interface CallableMap {
  [EventType.Default]?: Callable<Event>;
  [EventType.Custom]?: Callable<CustomEvent>;
  [EventType.Keyboard]?: Callable<KeyboardEvent>;
}

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

/** Any class that can update itself as a function of time */
export interface Updatable {
  update(dt: number): void;
}
