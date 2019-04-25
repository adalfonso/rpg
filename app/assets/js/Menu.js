export default class Menu {

    constructor(options) {
        this.options = options;
        this.currentOption = 0;
        this.active = true;

        document.addEventListener('keyup', e => {
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
        });
    }

    select() {
        this.active = false;
    }

    back() {

    }

    previousOption() {

    }

    nextOption() {

    }

    draw(ctx, width, height) {
        ctx.save();

        ctx.fillStyle = 'rgba(0, 0, 0, .85)';

        ctx.fillRect(0, 0, width, height);

        ctx.font = "42px Arial";
        ctx.fillStyle = '#FFF';
        ctx.textAlign = "center";

        ctx.fillText(
           this.options[0],
            width / 2, height / 2
        );

        ctx.restore();
    }
}