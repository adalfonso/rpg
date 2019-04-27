export default class InputHandler {
    constructor() {
        this.events = {};
    }

    register(target) {
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

    install(target, events) {
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

    unregister(target) {
        for (let event in this.events) {
            this.events[event] = this.events[event].filter(e => {
                return e.target !== target;
            });
        }
    }
}