import { Eventful } from "./interfaces";

/**
 * How events are stored locally
 *
 * @prop observer - event's observer
 * @prop handle   - how the event is handled
 */
type BrokeredEventTemplate = {
  observer: Eventful;
  handle: Function;
};

class EventBus {
  /**
   * Singleton instance
   */
  private static instance: EventBus;

  /**
   * Event store
   */
  private events: Record<string, BrokeredEventTemplate[]> = {};

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
    const events = observer.register();

    // An array here indicates that a classes's parents events are included
    if (Array.isArray(events)) {
      events.forEach((event) => this.install(observer, event));
    } else {
      this.install(observer, events);
    }
  }

  /**
   * Unregister an entity from the event bus
   *
   * @param observer - eventful entity
   */
  public unregister(observer: Eventful) {
    for (const event in this.events) {
      this.events[event] = this.events[event].filter(
        (e: BrokeredEventTemplate) => {
          return e.observer !== observer;
        }
      );
    }
  }

  /**
   * Emit an event to all entities listening
   *
   * @param event  - event name
   * @param detail - additional detail to pass along
   */
  public emit(event: string, detail?: Record<string, unknown>) {
    const e = new CustomEvent(event, { detail: detail });
    window.dispatchEvent(e);
  }

  /**
   * Install a list of events for a observer on the event bus
   *
   * @param observer - eventful entity
   * @param events   - a list of event callbacks
   */
  private install(
    observer: Eventful,
    events: Record<string, (input: unknown) => unknown>
  ) {
    for (const event in events) {
      const brokeredEvent: BrokeredEventTemplate = {
        observer: observer,
        handle: events[event],
      };

      if (!this.events.hasOwnProperty(event)) {
        this.events[event] = [];

        window.addEventListener(event, (e) => {
          this.events[event].forEach((ev: BrokeredEventTemplate) => {
            ev.handle(e);
          });
        });
      }

      this.events[event].push(brokeredEvent);
    }
  }
}

/**
 * Event bus singleton
 */
export const bus: EventBus = EventBus.getInstance();

export default EventBus;
