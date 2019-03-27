import Vector from './Vector.js';
import chars from './characters.js';
import { domify } from './helpers.js';

class Level {
    constructor(plan) {
        this.rows = plan.split("\n").map(row => [...row.trim()]);

        this.width = this.rows[0].length;
        this.height = this.rows.length;
        this.scale = 20;
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
                        chars[ch].create(new Vector(x, y), ch)
                    );

                    return 'empty';
                }
            });
        });

        return { grid: grid, actors: actors };
    }
}

export default Level;