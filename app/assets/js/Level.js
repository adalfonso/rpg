import Vector from './Vector.js';
import chars from './characters.js';
import { domify } from './helpers.js';

class Level {
    constructor(plan) {
        let rows = plan.split("\n").map(row => [...row.trim()]);

        this.width = rows[0].length;
        this.height = rows.length;
        this.scale = 20;
        this.actors = [];

        this.rows = rows.map((row, y) => {
            return row.map((ch, x) => {
                if (typeof chars[ch] === 'string') {
                    return chars[ch];

                } else {
                    this.actors.push(
                        chars[ch].create(new Vector(x, y), ch)
                    );

                    return 'empty';
                }
            })
        });
    }

    renderBoard() {
        let board = domify(
            'table',
            { class: 'board' },

            this.rows.map(row => {
                return domify('tr', {}, row.map(cell => {
                    return domify(
                        'td', {
                            class: cell,
                            style: 'height:' + this.scale + 'px;width:' + this.scale + 'px'
                        }
                    )
                }));
            })
        );

        document.body.appendChild(board);
    }

    renderActors() {
        this.actors.map(actor => {
            let el = domify('div', { class: actor.constructor.name.toLowerCase() });

            console.log(actor);

            el.style.top = actor.pos.y * this.scale + 'px';
            el.style.left = actor.pos.x * this.scale + 'px';
            el.style.height = this.scale + 'px';
            el.style.width = this.scale + 'px';

            return el;
        }).forEach(actor => {
            document.body.appendChild(actor);
        });
    }
}

export default Level;