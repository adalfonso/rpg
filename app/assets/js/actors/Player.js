import BaseActor from './BaseActor';
import Vector from '../Vector';

class Player extends BaseActor {
    constructor(pos, size) {
        super(pos, size);
        this.type = 'player';
    }

    static create(pos, size) {
        return new Player(pos, size);
    }

    update(time, state) {
        state.actors = state.actors.filter(actor => {
            return actor.type !== 'coin' ||
                !this.collidesWith(actor);
        });
    }

    move(key) {
        this.pos = this.moveTo(key);
    }

    moveTo(key) {
        switch(key) {
            case 'ArrowLeft':
                return this.pos.plus({ x: -.5, y: 0 });
            case 'ArrowDown':
                return this.pos.plus({ x: 0, y: .5 });
            case 'ArrowRight':
                return this.pos.plus({ x: .5, y: 0 });
            case 'ArrowUp':
                return this.pos.plus({ x: 0, y: -.5 });
            default:
                return this.pos;
        }
    }
}

export default Player;