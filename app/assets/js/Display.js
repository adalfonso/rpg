class Display {
    constructor(game) {
        let canvas = document.getElementById('game');
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.game = game;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.game.width, this.game.height);

        this.game.level.entities.forEach(entity => {
            entity.draw(this.ctx);
        });
    }
}

export default Display;