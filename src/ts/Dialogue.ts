import { handler } from './app';
import BaseActor from './actors/BaseActor';
import Player from './actors/Player';
import Vector from './Vector';
import InputHandler from './InputHandler';

export default class Dialogue {
    protected texts: string[];
    protected speaker: BaseActor;
    protected actors: BaseActor[];
    protected currentText: string;

    protected waiting: boolean;
    public done: boolean;

    protected index: number;
    protected frameLength: number;
    protected timeStore: number;

    constructor(texts: string[], speaker: BaseActor, actors: BaseActor[]) {
        this.texts = texts;
        this.speaker = speaker;
        this.actors = actors;
        this.currentText = '';

        this.index = 0;
        this.waiting = false;
        this.done = false;

        this.frameLength = 1000 / 24;
        this.timeStore = 0;

        this.actors.push(this.speaker);

        handler.register(this);
        this.start();
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
            this.speaker.dialogueName + ': ' + this.currentText,
            0, 0
        );

        ctx.restore();
    }

    start() {
        this.actors.forEach(a => {
            a.lock();
            a.inDialogue = true;
        });
    }

    stop() {
        this.actors.forEach(a => {
            a.unlock();
            a.inDialogue = false;
        });

        handler.unregister(this);
    }

    register(): object {
        return {
            keyup: (e: KeyboardEvent, handler: InputHandler) => {
                if (e.key === 'Enter') {
                    this.next(e);
                }

                if (this.done) {
                    this.stop();
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
        }
    }
}