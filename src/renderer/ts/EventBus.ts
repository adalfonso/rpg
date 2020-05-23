import { Eventful } from "./interfaces";

/**
 * How events are stored locally
 *
 * @type {BrokeredEventTemplate}
 *
 * @prop {Eventful} observer Event's observer
 * @prop {Function} handle   How the event is handled
 */
type BrokeredEventTemplate = {
  observer: Eventful;
  handle: Function;
};

class EventBus {
  /**
   * Singleton instance
   *
   * @prop {EventBus} instance
   */
  private static instance: EventBus;

  /**
   * Event store
   *
   * @prop {object} events
   */
  private events: object = {};

  /**
   * Create a new instance or get the shared instance
   *
   * @return {EventBus} Shared instance
   */
  public static getInstance() {
    EventBus.instance = EventBus.instance ?? new EventBus();

    return EventBus.instance;
  }

  /**
   * Register an entity on the event bus
   *
   * @param {Eventful} observer Entity to register
   */
  public register(observer: Eventful) {
    let events = observer.register();

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
   * @param {Eventful} observer Eventful entity
   */
  public unregister(observer: Eventful) {
    for (let event in this.events) {
      this.events[event] = this.events[event].filter(
        (e: BrokeredEventTemplate) => {
          return e.observer !== observer;
        }
      );
    }
  }

  /**
   * Emit an event to all entities listening
   * @param {string} event  Event name
   * @param {object} detail Additional detail to pass along
   */
  public emit(event: string, detail?: object) {
    let e = new CustomEvent(event, { detail: detail });
    window.dispatchEvent(e);
  }

  /**
   * Install a list of events for a observer Eventful entity on the event bus
   *
   * @param {Eventful} observer Eventful entity
   * @param {object}   events   A list of event callbacks
   */
  private install(observer: Eventful, events: object) {
    for (let event in events) {
      let brokeredEvent: BrokeredEventTemplate = {
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
 *
 * @const {EventBus} bus
 */
export const bus: EventBus = EventBus.getInstance();

export default EventBus;
