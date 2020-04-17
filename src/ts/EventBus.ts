import { Eventful } from "./interfaces";

export default class EventBus {
  /**
   * Event store
   *
   * @prop {object} events
   */
  private events: object = {};

  /**
   * Register an entity on the event bus
   *
   * @param {Eventful} target Entity to register
   */
  public register(target: Eventful) {
    let events = target.register();

    // An array here indicates that a classes's parents events are included
    if (Array.isArray(events)) {
      events.forEach((event) => this.install(target, event));
    } else {
      this.install(target, events);
    }
  }

  /**
   * Unregister an entity from the event bus
   *
   * @param {Eventful} target Eventful entity
   */
  public unregister(target: Eventful) {
    for (let event in this.events) {
      this.events[event] = this.events[event].filter((e) => {
        return e.target !== target;
      });
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
   * Install a list of events for a target Eventful entity on the event bus
   *
   * @param {Eventful} target Eventful entity
   * @param {object}   events A list of event callbacks
   */
  private install(target: Eventful, events: object) {
    for (let event in events) {
      if (!this.events.hasOwnProperty(event)) {
        this.events[event] = [];

        window.addEventListener(event, (e) => {
          this.events[event].forEach((ev) => {
            ev.handle(e);
          });
        });
      }

      this.events[event].push({
        target: target,
        handle: events[event],
      });
    }
  }
}
