import { handler } from './app';
import BaseActor from './actors/BaseActor';
import Player from './actors/Player';
import Vector from './Vector';
import InputHandler from './InputHandler';

export default class Dialogue {
    protected texts: string[];
    protected entity: any;
    protected player: any;
    protected currentText: string;

    protected waiting: boolean;
    public done: boolean;

    protected index: number;
    protected frameLength: number;
    protected timeStore: number;

    constructor(texts: string[], entity: BaseActor, player: BaseActor = entity) {
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

        handler.register(this);
    }

    update(dt: number) {
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

    draw(ctx: CanvasRenderingContext2D, offset: Vector) {
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

    register(): object {
        return {
            keyup: (e: KeyboardEvent, handler: InputHandler) => {
                if (e.key === 'Enter') {
                    this.next(e);
                }

                if (this.done) {
                    handler.unregister(this);
                }
            }
        };
    }

    next(e: KeyboardEvent) {
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