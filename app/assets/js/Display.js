class Display {
    constructor(canvas, game) {
        this.game = game;
        this.ctx = canvas.getContext('2d');

        canvas.width = this.game.width;
        canvas.height = this.game.height;

        this.ctx.imageSmoothingEnabled = false;

        this.buffer = document.createElement('canvas').getContext('2d');
        this.buffer.canvas.width = this.game.width;
        this.buffer.canvas.height = this.game.height;
        this.buffer.imageSmoothingEnabled = false;
    }

    draw(offset) {
        this.buffer.clearRect(0, 0, this.game.width, this.game.height);
        this.buffer.save();
        this.buffer.translate(offset.x, offset.y);
        this.buffer.fillRect(0, 0, this.game.width, this.game.height);

        this.game.level.map.draw(this.buffer);

        this.game.level.entities.forEach(entity => {
            entity.draw(this.buffer);
        });

        this.game.level.map.draw(this.buffer, true);

        this.buffer.restore();

        this.ctx.clearRect(0, 0, this.game.width, this.game.height);

        this.ctx.drawImage(
            this.buffer.canvas,
            0, 0,
            this.buffer.canvas.width,
            this.buffer.canvas.height,
            0, 0,
            this.ctx.canvas.width,
            this.ctx.canvas.height
        );
    }
}

export default Display;