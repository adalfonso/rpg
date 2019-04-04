import Vector from "./Vector";

class State {
    constructor(resources) {
        this.grid = resources.grid || [];
        this.actors = resources.actors || [];
        this.player = resources.actors
            .filter(actor => actor.type === 'player' )[0];
    }

    update(time, level) {
        this.actors.forEach(actor => {
            actor.update(time, this);
        });

        return this;
    }
}

export default State;