import npcs from './npcs.json';
import BaseActor from './BaseActor';
import Vector from '../Vector.js';
import Dialogue from '../Dialogue.js';

export default class NPC extends BaseActor {
    constructor(obj, player) {
        super(
            new Vector(obj.x, obj.y),
            new Vector(obj.width, obj.height)
        );

        let name = obj.properties.filter(
            prop => prop.name === 'name'
        )[0].value;

        let npc = npcs[name];

        if (!npc) {
            throw new Error(
                'NPC data for ' + name +
                ' is not defined in npcs.json'
            );
        }

        this.name = name;
        this.npc = npc;
        this.dialogue = null;
        this.playerRef = player;

        _handler.register(this);
    }

    get dialogueName() {
        return this.npc.display_name;
    }

    speak() {
        if (this.dialogue || !this.collidesWith(this.playerRef)) {
           return;
        }

        this.dialogue = new Dialogue(this.npc.default.speech, this, this.playerRef);
    }

    update(dt, player) {
        if (this.dialogue && this.dialogue.done) {
            this.dialogue = null;

        } else if (this.dialogue){
            this.dialogue.update(dt);
        }
    }

    draw(ctx, offset) {
        if (this.dialogue) {
            this.dialogue.draw(ctx, offset);
        }
    }

    register() {
        return {
            keyup: e => {
                if (e.key === ' ' || e.key === 'Enter') {
                    this.speak();
                }
            }
        };
    }
}