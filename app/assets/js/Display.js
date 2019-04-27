class Display {
    constructor(canvas, game) {
        this.game = game;
        this.ctx = canvas.getContext('2d');
        this.buffer = document.createElement('canvas').getContext('2d');
        this.triggerResize(this.game.width, this.game.height);

        _handler.register(this);
    }

    draw(offset) {
        this.buffer.clearRect(0, 0, this.game.width, this.game.height);
        this.buffer.save();
        this.buffer.translate(offset.x, offset.y);
        this.buffer.fillRect(0, 0, this.game.width, this.game.height);

        this.game.level.map.draw(this.buffer);

        this.game.level.entities.forEach(entity => {
            entity.draw(this.buffer, offset);
        });

        this.game.level.map.draw(this.buffer, true);

        if (this.game.inventory.active) {
            this.game.inventory.draw(
                this.buffer, this.game.width, this.game.height, offset
            );
        }

        if (this.game.menu.active) {
            this.game.menu.draw(
                this.buffer, this.game.width, this.game.height, offset
            );
        }

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

    triggerResize() {
        if (window.innerWidth < this.game.resolution.x) {
            let ratio = this.game.height / this.game.width;
            let width = Math.floor(window.innerWidth);
            let height = Math.floor(window.innerWidth * ratio);

            if (width % 2 === 1) {
                width--;
            }

            if (height % 2 === 1) {
                height--;
            }

            this.resize(width, height);

        } else if (this.width !== this.game.resolution.x) {
            this.resize(
                this.game.resolution.x,
                this.game.resolution.y
            );
        }
    }

    resize(width, height) {
        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;
        this.ctx.imageSmoothingEnabled = false;

        this.buffer.canvas.width = width;
        this.buffer.canvas.height = height;
        this.buffer.imageSmoothingEnabled = false;

        this.game.resize(width, height);
    }

    register() {
        return {
            resize: e => this.triggerResize()
        };
    }
}

export default Display;