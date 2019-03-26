class Player {
    constructor(vec) {
        this.pos = vec;
    }

    static create(vec) {
        return new Player(vec);
    }
}

export default Player;