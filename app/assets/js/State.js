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
            let distance = actor.travelDistance(time);
            let movesTo = this.player.pos.plus(distance);
            let touches = level.touches(movesTo, this.player.size, 'wall');

            if (touches) {
                actor.velocity = new Vector(0, 0);
            }

            actor.update(time, level);
        });

        return this;
    }
}

export default State;