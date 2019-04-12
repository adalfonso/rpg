import Player from './actors/Player';
import tileset from '../img/dungeon_sheet.png';
import Map from './inanimates/Map';

class Level {
    constructor(json, config) {
        this.config = config;
        this.inanimates = [];
        this.actors = [];

        this.player = new Player(
            { x: 75, y: 75 },
            { x: 64, y: 64 }
        );

        this.map = new Map(json, tileset, this.player);
    }

    get entities() {
        return [this.map, this.player, ...this.inanimates, ...this.actors];
    }
}

export default Level;