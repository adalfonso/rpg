import Vector from './Vector.js';
import BaseActor from './actors/BaseActor.js';
import chars from './characters.js';

class Level {
    constructor(plan, config) {
        this.config = config;
        this.rows = plan.split("\n").map(row => [...row.trim()]);
        this.level = 0;

        this.width = this.rows[0].length;
        this.height = this.rows.length;
        this.actors = [];
    }

    getRows() {
        let actors = [];

        let grid = this.rows.map((row, y) => {
            return row.map((ch, x) => {
                if (typeof chars[ch] === 'string') {
                    return chars[ch];

                } else {
                    if (ch !== '@' || !this.config.hasOwnProperty('origin')) {
                        actors.push(
                            chars[ch].create(
                                new Vector(x, y),
                                new Vector(1,1)
                            )
                        );
                    }

                    return 'empty';
                }
            });
        });

        this.rows = grid;

        if (this.config.hasOwnProperty('origin')) {
            actors.push(
                chars['@'].create(
                    this.findPlayerStart(),
                    new Vector(1, 1)
                )
            );
        }

        this.actors = actors;

        return { grid: grid, actors: actors };
    }

    touches(pos, size, type) {
        let x1 = Math.floor(pos.x);
        let x2 = Math.ceil(pos.x + size.x);
        let y1 = Math.floor(pos.y);
        let y2 = Math.ceil(pos.y + size.y);

        for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
                let isOutside = x < 0 || x >= this.width ||
                    y < 0 || y >= this.height;

                let touching = isOutside ? "wall" : this.rows[y][x];

                if (touching === type) {
                    return true;
                }
            }
        }
        return false;
    }

    portalCollisionIndex(charName, player) {
        let vecs = this.locateByCharName(charName);

        return vecs.map((vec, index) => {
            let actor = new BaseActor(
                vec,
                new Vector(1, 1)
            );

            return {
                index: index,
                collides: player.collidesWith(actor)
            };
        }).filter(vec => vec.collides);
    }

    findPlayerStart() {
        let charName = this.config.origin.charName === 'portal-next'
            ? 'portal-previous'
            : 'portal-next';

        let vecs = this.locateByCharName(charName);

        for (let i = 0; i < vecs.length; i++) {
            if (i === this.config.origin.collision[0].index) {
                return vecs[i];
            }
        }
    }

    locateByCharName(charName) {
        let vecs = [];

        for (let y = 0, y2 = this.height; y < y2; y++) {
            for (let x = 0, x2 = this.width; x < x2; x++) {
                if (this.rows[y][x] === charName) {
                    vecs.push(new Vector(x,y));
                }
            }
        }

        return vecs;
    }
}

export default Level;