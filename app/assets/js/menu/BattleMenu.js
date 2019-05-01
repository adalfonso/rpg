import BaseMenu from './BaseMenu';

export default class BattleMenu extends BaseMenu {

    constructor(...args) {
        super(args);
    }

    draw(ctx, offset, entity) {
        ctx.save();
        ctx.font = '12px Arial';

        ctx.translate(
            offset.x + entity.pos.x - 72 * this.options.length,
            offset.y + entity.pos.y + entity.size.y + 24
        );

        this.options.forEach(option => {
            let height = option === this.options[this.index] ? 64 : 24;

            ctx.translate(72, 0);
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, 64, height);
            ctx.fillStyle = '#000';
            ctx.fillText(option.type, 4, 4 + 12);
        });

        ctx.restore();
    }

    register() {
        return {
            keyup: e => {
                switch(e.key) {
                    case 'ArrowDown':
                        this.select();
                        break;
                    case 'ArrowUp':
                        this.back();
                        break;
                    case 'ArrowLeft':
                        this.previousOption();
                        break;
                    case 'ArrowRight':
                        this.nextOption();
                        break;
                }
            }
        }
    }
}