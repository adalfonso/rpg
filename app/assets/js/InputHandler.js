export default class InputHandler {
    constructor(game) {
        this.game = game;

        document.addEventListener('keydown', e => {
            if (!e.key.match(/Arrow/)) {
                return;
            }

            this.game.level.player.move(e.key);
        });

        document.addEventListener("keyup", e => {
            if (!e.key.match(/Arrow/)) {
                return;
            }

            this.game.level.player.stop(e.key);
        });
    }
}