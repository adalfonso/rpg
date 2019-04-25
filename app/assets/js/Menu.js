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
        if (this.currentOption === 0) {
            this.active = false;
        }
    }

    back() {

    }

    previousOption() {
        if (this.currentOption === 0) {
            this.currentOption = this.options.length - 1;
        } else {
            this.currentOption--;
        }
    }

    nextOption() {
        if (this.currentOption === this.options.length - 1) {
            this.currentOption = 0;
        } else {
            this.currentOption++;
        }
    }

    draw(ctx, width, height) {
        ctx.save();

        ctx.fillStyle = 'rgba(0, 0, 0, .85)';

        ctx.fillRect(0, 0, width, height);

       ctx.fillStyle = '#FFF';
        ctx.textAlign = "center";

        this.options.forEach((option, index) => {
            ctx.save();

            if (index === this.currentOption) {
                ctx.shadowColor = "#FFF";
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.shadowBlur = 4;
                ctx.font = "bold 42px Arial";

            } else {
                ctx.font = "42px Arial";
            }

            ctx.fillText(
                index === this.currentOption
                    ? '▶ ' + option
                    : option,
                width / 2,
                height / (this.options.length - index) * .5
            )

            ctx.restore();
        });

        ctx.restore();
    }
}