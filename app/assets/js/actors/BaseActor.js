import { domify } from './../helpers.js';

class BaseActor {
    constructor(pos) {
        this.pos = pos;
        this.el = domify('div', { class: this.constructor.name.toLowerCase() });
        this.el.style.top = this.pos.y * this.scale + 'px';
        this.el.style.left = this.pos.x * this.scale + 'px';
        this.el.style.height = this.scale + 'px';
        this.el.style.width = this.scale + 'px';
    }

    static create(pos) {
        return new BaseActor(pos);
    }
}

export default BaseActor;