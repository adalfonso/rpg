import BaseMenu from './BaseMenu';

export default class BattleMenu extends BaseMenu {

    constructor(...args) {
        super(args);
    }

    draw(ctx, offset, entity) {
        ctx.save();
        ctx.font = '12px Arial';

        ctx.translate(
            offset.x + entity.pos.x - 72 * this.menu.length,
            offset.y + entity.pos.y + entity.size.y + 24
        );

        this.menu.forEach(option => {
            let isSelected = option === this.selected[0];
            let height = isSelected ? 64 : 24;

            ctx.translate(72, 0);
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, 64, height);
            ctx.fillStyle = '#000';
            ctx.fillText(option.type, 4, 4 + 12);

            if (isSelected && option.menu && option.menu.length) {
                option.menu.forEach((subOption, index) => {
                    ctx.save();

                    if (this.currentOption === subOption) {
                        ctx.font = 'bold 12px Arial';
                    } else {
                        ctx.font = '12px Arial';
                    }

                    let desc = subOption.name ? subOption.name : subOption;

                    ctx.translate(0, 18 * (index + 1));
                    ctx.fillText(desc, 4, 16);
                    ctx.restore();
                });
            }
        });

        ctx.restore();
    }

    register() {
        return {
            keyup: e => {
                let menu = this.currentMenu;
                let option = this.currentOption;

                switch(e.key) {
                    case 'ArrowDown':
                        if (this.hasSubMenu()) {
                            this.select();

                        } else if (this.selected.length > 1) {
                            this.nextOption();
                        }

                        break;
                    case 'ArrowUp':
                        if (option === menu[0]) {
                            this.back();

                        } else if (this.selected.length > 1) {
                            this.previousOption();
                        }

                        break;
                    case 'ArrowLeft':
                        if (this.selected.length === 1) {
                            this.previousOption();
                        }

                        break;
                    case 'ArrowRight':
                        if (this.selected.length === 1) {
                            this.nextOption();
                        }

                        break;
                }
            }
        }
    }
}