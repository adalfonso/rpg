import BaseActor from './BaseActor';

class Coin extends BaseActor {
    constructor(pos, size) {
        super(pos, size);
        this.type = 'coin';
    }

    static create(pos, size) {
        return new Coin(pos, size);
    }

    update(time) {
    }
}

export default Coin;