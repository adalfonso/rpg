class Coin {
    constructor(pos) {
        this.pos = pos;        
    }

    static create(pos) {
        return new Coin(pos);
    }
}

export default Coin;