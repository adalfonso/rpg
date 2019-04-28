import BaseMenu from './BaseMenu';

export default class Inventory extends BaseMenu {
    constructor(options) {
        super(options);
        this.active = false;

        this.items = [];
        this.equipable = [];
        this.special = [];

        this.equiped = {
            weapon: null,
            armor: null,
            spell: null
        };
    }

    store(item) {
        this[item.type].push(item);
    }

    draw(ctx, width, height, offset) {
        ctx.save();
        ctx.translate(-offset.x, -offset.y);
        ctx.fillStyle = 'rgba(200, 200, 200, .96)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#75A';
        ctx.textAlign = "left";

        this.options.forEach((option, index) => {
            if (index === this.index) {
                ctx.shadowColor = "#75A";
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.shadowBlur = 4;
                ctx.font = "bold 24px Arial";

            } else {
                ctx.font = "24px Arial";
            }

            ctx.fillText(
                option.description,
                48, 72 * (index + 1)
            )
        });

        ctx.restore();
    }

    register() {
        return [
            super.register(),
            {
                keyup: e => {
                    if (e.key === 'i') {
                        this.active = !this.active;
                    }
                }
            }
        ];
    }
}