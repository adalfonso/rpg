import { CallableMap, Eventful } from "../interfaces";

export enum EventType {
  Default,
  Custom,
  Keyboard,
}

/**
 * How events are stored locally
 *
 * @prop observer - event's observer
 * @prop handle   - how the event is handled
 */
type BrokeredEventTemplate = {
  observer: Eventful;
  handle: (e: Event) => void;
};

type PermittedEvent = Event | CustomEvent | KeyboardEvent;

export class EventBus {
  /** Singleton instance */
  private static instance: EventBus;

  /** Event store */
  private _handlers: Record<
    EventType,
    Record<string, BrokeredEventTemplate[]>
  > = {
    [EventType.Default]: {},
    [EventType.Custom]: {},
    [EventType.Keyboard]: {},
  };

  /**
   * Create a new instance or get the shared instance
   *
   * @return shared instance
   */
  public static getInstance() {
    EventBus.instance = EventBus.instance ?? new EventBus();

    return EventBus.instance;
  }

  /**
   * Register an entity on the event bus
   *
   * @param observer - entity to register
   */
  public register(observer: Eventful) {
    const handlers = observer.register();

    // An array here indicates that a classes's parents events are included
    if (Array.isArray(handlers)) {
      handlers.forEach((event) => this.install(observer, event));
    } else {
      this.install(observer, handlers);
    }
  }

  /**
   * Unregister an entity from the event bus
   *
   * @param observer - eventful entity
   */
  public unregister(observer: Eventful) {
    for (const type in this._handlers) {
      for (const name in this._handlers[type]) {
        this._handlers[type][name] = this._handlers[type][name].filter(
          (e: BrokeredEventTemplate) => e.observer !== observer
        );
      }
    }
  }

  /**
   * Emit an event to all entities listening
   *
   * @param event  - event name
   * @param detail - additional detail to pass along
   */
  public emit(event: string, detail?: Record<string, unknown>) {
    window.dispatchEvent(new CustomEvent(event, { detail }));
  }

  /**
   * Install a list of events for a observer on the event bus
   *
   * @param observer - eventful entity
   * @param map   - a list of event callbacks
   */
  private install(observer: Eventful, map: CallableMap) {
    for (const type in map) {
      for (const name in map[type]) {
        const brokeredEvent = { observer, handle: map[type][name] };

        if (this._handlers[type][name] === undefined) {
          this._handlers[type][name] = [];

          window.addEventListener(name, (e: PermittedEvent) => {
            const handlers = this._getHandersByEvent(e);

            handlers[name].forEach((ev: BrokeredEventTemplate) => ev.handle(e));
          });
        }

        this._handlers[type][name].push(brokeredEvent);
      }
    }
  }

  /**
   * Get events by EventType as pertains to a given event
   *
   * @param e - actual event
   *
   * @return a list of event handlers
   */
  private _getHandersByEvent(e: PermittedEvent) {
    if (e instanceof CustomEvent) {
      return this._handlers[EventType.Custom];
    } else if (e instanceof KeyboardEvent) {
      return this._handlers[EventType.Keyboard];
    }

    return this._handlers[EventType.Default];
  }
}

/** Event bus singleton */
export const bus: EventBus = EventBus.getInstance();
