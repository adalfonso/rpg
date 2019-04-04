import { domify } from './helpers.js';

class Display {
    constructor(state) {
        this.state = state;

        this.layers = {
            grid: null,
            actor: null
        };

        this.scale = 20;

        this.mount = domify('div', { class: 'game' });
        document.body.appendChild(this.mount);
    }

    drawGrid() {
        this.layers.grid = domify(
            'table',
            { class: 'grid' },

            this.state.grid.map(row => {
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

        this.mount.appendChild(this.layers.grid);
    }

    drawActors() {
        let actors = domify('div', { class: 'actors' });

        this.state.actors.map(actor => {
            let el = domify('div', { class: actor.type });

            el.style.top = actor.pos.y * this.scale + 'px';
            el.style.left = actor.pos.x * this.scale + 'px';
            el.style.height = this.scale + 'px';
            el.style.width = this.scale + 'px';

            return el;
        }).forEach(actor => {
            actors.appendChild(actor);
        });

        this.mount.appendChild(actors);
        this.layers.actor = actors;
    }

    sync(state) {
        if (this.layers.actor) {
            this.layers.actor.remove();
            this.drawActors();
        }
    }
}

export default Display;