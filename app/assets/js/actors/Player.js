import BaseActor from './BaseActor';

class Player extends BaseActor {
    constructor(pos) {
        super(pos);

        document.addEventListener('click', e => {
            this.el.style.left = '1000px';
        });
    }

    static create(pos) {
        return new Player(pos);
    }

    update(time) {
        //this.pos.x += .1;
    }
}

export default Player;