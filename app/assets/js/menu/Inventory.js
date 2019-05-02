import BaseMenu from './BaseMenu';
import Vector from '../Vector';

export default class Inventory extends BaseMenu {
    constructor() {
        let menu = [{
            type: 'item',
            description: 'Items',
            menu: []
        }, {
            type: 'equipable',
            description: 'Equipment',
            menu: []
        }, {
            type: 'special',
            description: 'Special',
            menu: []
        }];

        super(menu);
        this.active = false;

        this.equipped = {
            weapon: null,
            armor: null,
            spell: null
        };
    }

    store(item) {
        this.menu.filter(option => {
            return option.type === item.type
        })[0].menu.push(item);
    }

    draw(ctx, width, height, offset) {
        ctx.save();
        ctx.translate(-offset.x, -offset.y);
        ctx.fillStyle = 'rgba(200, 200, 200, .96)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#75A';
        ctx.textAlign = "left";

        let current = this.selected[this.selected.length - 1];

        // Menu Tier
        this.selected.reduce((subMenuOffset, selected, index) => {
            let menu = index > 0
                ? this.selected[index - 1].menu
                : this.menu;

            return subMenuOffset +

            // Menu menu
            menu.reduce((subCarry, option, subIndex) => {
                let pos = new Vector(
                    48 + 200 * index,
                    48 + 48 * (subIndex + subMenuOffset + 1)
                );

                ctx.save();
                ctx.font = "24px Arial";

                if (option === current) {
                    ctx.shadowColor = "#75A";
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;
                    ctx.shadowBlur = 4;
                    ctx.font = "bold 24px Arial";
                }

                ctx.fillText(option.description, pos.x, pos.y);
                ctx.restore();

                return subCarry + (option === selected ? subIndex : 0)
            }, 0);
        }, 0);

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