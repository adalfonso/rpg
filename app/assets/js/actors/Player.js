import BaseActor from './BaseActor';

class Player extends BaseActor {
    constructor(pos) {
        super(pos);

        document.addEventListener('keydown', e => {
            console.log(e);
            if (e.key.match(/Arrow/)) {
                this.move(e.key);
            }
        });
    }

    static create(pos) {
        return new Player(pos);
    }

    update(time) {

    }

    move(key) {
        switch(key) {
            case 'ArrowLeft':
                this.pos.x--;
                break;
            case 'ArrowDown':
                this.pos.y++;
                break;
            case 'ArrowRight':
                this.pos.x++
                break;
            case 'ArrowUp':
                this.pos.y--
                break;
        }
    }
}

export default Player;