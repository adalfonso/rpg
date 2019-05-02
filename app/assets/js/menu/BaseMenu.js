export default class BaseMenu {

    constructor(menu) {
        this.menu = menu;
        this.selected = [];
        this.active = true;
        this.selected.push(this.menu[0]);

        _handler.register(this);
    }

    select() {
        let option = this.selected[this.selected.length - 1];

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

    previousOption() {
        let menu = this.selected.length > 1
            ? this.selected[this.selected.length - 2].menu
            : this.menu;

        let option = this.selected[this.selected.length - 1];

        let index = menu.reduce((carry, value, index) => {
            return value === option ? index : carry;
        }, 0);

        if (index === 0) {
            this.selected[this.selected.length - 1] = menu[menu.length - 1]
        } else {
            this.selected[this.selected.length - 1] = menu[index - 1];
        }
    }

    nextOption() {
        let menu = this.selected.length > 1
            ? this.selected[this.selected.length - 2].menu
            : this.menu;

        let option = this.selected[this.selected.length - 1];

        let index = menu.reduce((carry, value, index) => {
            return value === option ? index : carry;
        }, 0);

        if (index === menu.length - 1) {
            this.selected[this.selected.length - 1] = menu[0];
        } else {
            this.selected[this.selected.length - 1] = menu[index + 1];
        }
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
                        this.previousOption();
                        break;
                    case 'ArrowDown':
                        this.nextOption();
                        break;
                }
            }
        };
    }
}