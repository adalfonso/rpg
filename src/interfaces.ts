import * as ex from "excalibur";
import { EventType } from "./event/EventBus";

// 2D drawing strategy (how we used to do it)
export type DrawStrategy = (
  ctx: CanvasRenderingContext2D,
  resolution: ex.Vector
) => void;

/** Any class that manually renders itself on a canvas */
export interface Drawable {
  draw(
    ctx: ex.ExcaliburGraphicsContext,
    resolution: ex.Vector,
    strategy: DrawStrategy
  ): void;
}

/** Any class that manually renders itself on a canvas with an offset */
// TODO: refactor this. It relies on Renderable
export interface OffsetDrawable {
  draw(
    ctx: CanvasRenderingContext2D,
    offset: ex.Vector,
    resolution: ex.Vector
  ): void;
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

export interface Stateful<T> {
  state_ref: string;
  state: T;
}
