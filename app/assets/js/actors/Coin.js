import BaseActor from './BaseActor';

class Coin extends BaseActor {
    constructor(pos) {
        super(pos);
    }

    static create(pos) {
        return new Coin(pos);
    }

    update(time) {
        //console.log(time, this);
    }
}

export default Coin;