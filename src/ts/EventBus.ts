import Eventful from "./Eventful";

export default class EventBus {
  protected _events: object = {};

  /**
   * Register an entity on the event bus
   *
   * @param {Eventful} target Entity to register
   */
  public register(target: Eventful) {
    let events = target.register();

    if (Array.isArray(events)) {
      events.forEach((event) => this._install(target, event));
    } else {
      this._install(target, events);
    }
  }

  /**
   * Unregister an entity from the event bus
   *
   * @param {Eventful} target Eventful entity
   */
  public unregister(target: Eventful) {
    for (let event in this._events) {
      this._events[event] = this._events[event].filter((e) => {
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
   *
   * @param target
   * @param events
   */
  private _install(target: Eventful, events: object) {
    for (let event in events) {
      if (!this._events.hasOwnProperty(event)) {
        this._events[event] = [];

        window.addEventListener(event, (e) => {
          this._events[event].forEach((ev) => {
            ev.handle(e, this);
          });
        });
      }

      this._events[event].push({
        target: target,
        handle: events[event],
      });
    }
  }
}
