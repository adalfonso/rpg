import Player from './actors/Player';
import tileset from '../img/dungeon_sheet.png';
import Map from './inanimates/Map';
import config from './config';
import Vector from './Vector';
import Dialogue from './Dialogue';
import BaseInanimate from './inanimates/BaseInanimate';
import BaseActor from './actors/BaseActor';

class Level {
    protected inanimates: BaseInanimate[];
    protected actors: BaseActor[];
    protected dialogues: Dialogue[];
    public player: Player;
    public map: Map;

    constructor(json) {
        this.inanimates = [];
        this.actors = [];
        this.dialogues = [];

        this.player = new Player(
            new Vector(75, 75),
            new Vector(36, 64)
        );

        this.reload(json);

        // this.dialogues.push(
        //     new Dialogue([
        //         'Huh... Where am I?',
        //         'How did I get here?'
        //     ], this.player)
        // );
    }

    reload(json, portal?) {
        if (this.map) {
            this.map.destruct();
        }

        this.map = new Map(json, tileset, this.player);

        let start = portal
            ? this.map.playerStarts[portal.portal_from]
            : this.map.playerStarts['0.0'];

        this.player.pos.x = start.x * config.scale;
        this.player.pos.y = start.y * config.scale;
    }

    update(dt: number) {
        this.entities.forEach(entity => {
            entity.update(dt);
        });

        this.dialogues.forEach((dialogue, index) => {
            if (dialogue.done) {
                this.dialogues.splice(index, 1);
            }
        });

        return this.map.update(dt);
    }

    get entities(): any[] {
        return [
            this.player, ...this.inanimates,
            ...this.actors, ...this.dialogues,
            ...this.map.npcs, ...this.map.enemies
        ];
    }
}

export default Level;