import { handler } from '../app';

export default class BaseMenu {

    constructor(menu) {
        this.menu = menu;
        this.selected = [];
        this.active = true;
        this.selected.push(this.menu[0]);

        handler.register(this);
    }

    select() {
        let option = this.currentOption;

        if (option.hasOwnProperty('menu') && option.menu.length) {
            this.selected.push(option.menu[0]);

        } else if (option.hasOwnProperty('action')) {
            option.action(this);
        }
    }

    back() {
        if (this.selected.length > 1) {
            return this.selected.pop();
        }

        this.active = false;
    }

    previous() {
        let menu = this.currentMenu;
        let option = this.currentOption;

        let index = menu.reduce((carry, value, index) => {
            return value === option ? index : carry;
        }, 0);

        if (index === 0) {
            this.selected[this.selected.length - 1] = menu[menu.length - 1]
        } else {
            this.selected[this.selected.length - 1] = menu[index - 1];
        }
    }

    next() {
        let menu = this.currentMenu;
        let option = this.currentOption;

        let index = menu.reduce((carry, value, index) => {
            return value === option ? index : carry;
        }, 0);

        if (index === menu.length - 1) {
            this.selected[this.selected.length - 1] = menu[0];
        } else {
            this.selected[this.selected.length - 1] = menu[index + 1];
        }
    }

    hasSubMenu() {
        let current = this.currentOption;

        return current.menu && current.menu.length;
    }

    draw(ctx, width, height, offset) {}

    register() {
        return {
            keyup: e => {
                if (!this.active) {
                    return;
                }

                if (e.key === 'Escape') {
                    return this.active = false;
                }

                switch(e.key) {
                    case 'ArrowRight':
                    case 'Enter':
                        this.select();
                        break;
                    case 'ArrowLeft':
                    case 'Backspace':
                        this.back();
                        break;
                    case 'ArrowUp':
                        this.previous();
                        break;
                    case 'ArrowDown':
                        this.next();
                        break;
                }
            }
        };
    }

    get currentOption () {
        return this.selected[this.selected.length - 1];
    }

    get currentMenu() {
        return this.selected.length > 1
            ? this.selected[this.selected.length - 2].menu
            : this.menu;
    }
}