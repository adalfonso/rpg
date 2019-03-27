class State {
    constructor(resources) {
        this.grid = resources.grid || [];
        this.actors = resources.actors || [];
    }

    update(time, arrows) {
        this.actors.forEach(actor => {
            actor.update(time);
        });

        return this;
    }
}

export default State;