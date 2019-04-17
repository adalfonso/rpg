import Player from './actors/Player';
import tileset from '../img/dungeon_sheet.png';
import Map from './inanimates/Map';
import config from './config';

class Level {
    constructor(json) {
        this.inanimates = [];
        this.actors = [];

        this.player = new Player(
            { x: 75, y: 75 },
            { x: 64, y: 64 }
        );

        this.reload(json);
    }

    reload(json, portal) {
        this.map = new Map(json, tileset, this.player);

        let start = portal
            ? this.map.playerStarts[portal.portal_from]
            : this.map.playerStarts['0.0'];

        this.player.pos.x = start.x * config.scale;
        this.player.pos.y = start.y * config.scale;
    }

    update(dt) {
        this.entities.forEach(entity => {
            entity.update(dt);
        });

        return this.map.update(dt);
    }

    get entities() {
        return [this.player, ...this.inanimates, ...this.actors];
    }
}

export default Level;