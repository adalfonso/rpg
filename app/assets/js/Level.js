import Vector from './Vector.js';
import chars from './characters.js';

class Level {
    constructor(plan) {
        this.rows = plan.split("\n").map(row => [...row.trim()]);

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
                    actors.push(
                        chars[ch].create(
                            new Vector(x, y),
                            new Vector(1,1)
                        )
                    );

                    return 'empty';
                }
            });
        });

        this.rows = grid;
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
}

export default Level;