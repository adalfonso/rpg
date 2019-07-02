import BaseMenu from './BaseMenu'

export default class StartMenu extends BaseMenu {
    constructor() {
        let menu = [{
            type: 'start',
            description: 'Press Enter to Start!',
            action: menu => { menu.active = false }
        }, {
            type: 'load',
            description: 'Load Saved State (doesn\'t work yet)',
            action: menu => {}
        }];

        super(menu);
    }

    draw(ctx, width, height, offset) {
        ctx.save();
        ctx.translate(-offset.x, -offset.y);
        ctx.fillStyle = 'rgba(0, 0, 0, .85)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#FFF';
        ctx.textAlign = "center";

        this.menu.forEach((option, index) => {
            let current = this.menu[index];
            let selected = current === this.currentOption;

            if (selected) {
                ctx.shadowColor = "#FFF";
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.shadowBlur = 4;
                ctx.font = "bold 42px Arial";

            } else {
                ctx.font = "42px Arial";
            }

            ctx.fillText(
                selected ? '▶ ' + current.description : current.description,
                width / 2,
                height / (this.menu.length - index) * .5
            )
        });

        ctx.restore();
    }
}