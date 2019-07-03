export default class InputHandler {
    protected events: object;
    protected customEvents: object;

    constructor() {
        this.events = {};
        this.customEvents = {};
    }

    register(target: any) {
        if (typeof target.register !== 'function') {
            throw new Error('Target class does not have event register method');
        }

        let events = target.register();

        if (Array.isArray(events)) {
            events.forEach(event => this.install(target, event));
        } else {
            this.install(target, events)
        }
    }

    install(target: any, events: object[]) {
        for (let event in events) {
            if (!this.events.hasOwnProperty(event)) {
                this.events[event] = [];

                window.addEventListener(event, e => {
                    this.events[event].forEach(ev => {
                        ev.handle(e, this);
                    });
                });
            }

            this.events[event].push({
                target: target,
                handle: events[event]
            });
        }
    }

    unregister(target: any) {
        for (let event in this.events) {
            this.events[event] = this.events[event].filter(e => {
                return e.target !== target;
            });
        }
    }

    trigger(event: string, detail: object) {
        let e = new CustomEvent(event, { detail: detail });
        window.dispatchEvent(e);
    }
}