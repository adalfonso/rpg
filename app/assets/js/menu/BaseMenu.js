export default class BaseMenu {

    constructor(options) {
        this.options = options;
        this.index = 0;
        this.subIndex = null;
        this.active = true;

        _handler.register(this);
    }

    select() {
        let option = this.subIndex === null
            ? this.options[this.index]
            : this.options[this.index].data[this.subIndex];

        if (option.data && option.data.length) {
            this.subIndex = 0;

        } else if (this.subIndex !== null) {
            option.select();

        } else if (option.hasOwnProperty('action')) {
            option.action(this);
        }
    }

    back() {
        if (this.subIndex !== null) {
            this.subIndex = null;

        } else {
            this.active = false;
        }
    }

    previousOption() {
        if (this.subIndex === null) {
            if (this.index === 0) {
                this.index = this.options.length - 1;
            } else {
                this.index--;
            }

        } else {
            if (this.subIndex === 0) {
                this.subIndex = this.options[this.index].data.length - 1;
            } else {
                this.subIndex--;
            }
        }
    }

    nextOption() {
        if (this.subIndex === null) {
            if (this.index === this.options.length - 1) {
                this.index = 0;
            } else {
                this.index++;
            }

        } else {
            if (this.subIndex === this.options[this.index].data.length - 1) {
                this.subIndex = 0;
            } else {
                this.subIndex++;
            }
        }
    }

    draw(ctx, width, height, offset) {}

    register() {
        return {
            keyup: e => {
                if (!this.active) {
                    return;
                }

                switch(e.key) {
                    case 'Enter':
                        this.select();
                        break;
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