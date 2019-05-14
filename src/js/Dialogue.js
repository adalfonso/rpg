export default class Dialogue {
    constructor(texts, entity, player = entity) {
        this.texts = texts;
        this.entity = entity;
        this.player = player;
        this.currentText = '';

        this.index = 0;
        this.waiting = false;
        this.done = false;

        this.frameLength = 1000 / 24;
        this.timeStore = 0;
        this.entity.lock();
        this.entity.inDialogue = true;
        this.player.lock();
        this.player.inDialogue = true;

        _handler.register(this);
    }

    update(dt) {
        if (this.waiting) {
            return;
        }

        this.timeStore += dt;

        while(this.timeStore > this.frameLength) {
            this.currentText = this.texts[this.index]
                .substring(0, this.currentText.length + 1);

            this.timeStore -= this.frameLength;
        }

        if (this.currentText === this.texts[this.index]) {
            return this.waiting = true;
        }
    }

    draw(ctx, offset) {
        ctx.save();
        ctx.translate(32 - offset.x, 48 - offset.y);
        ctx.font = "30px Arial";
        ctx.fillStyle = '#FFF';

        ctx.fillText(
            this.entity.dialogueName + ': ' + this.currentText,
            0, 0
        );

        ctx.restore();
    }

    register() {
        return {
            keyup: (e, handler) => {
                if (e.key === 'Enter') {
                    this.next();
                }

                if (this.done) {
                    handler.unregister(this);
                }
            }
        };
    }

    next(e) {
        if (!this.waiting || this.done) {
            return;
        }

        if (this.index + 1 < this.texts.length) {
            this.index++;
            this.timeStore = 0;
            this.currentText = '';
            this.waiting = false;
        } else {
            this.done = true;
            this.entity.inDialogue = false;
            this.entity.unlock();
            this.player.inDialogue = false;
            this.player.unlock();
        }
    }
}