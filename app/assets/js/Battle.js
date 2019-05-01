import BattleMenu from "./menu/BattleMenu";
import Vector from "./Vector";

export default class Battle {

    constructor(player, enemy) {
        this.active = true;

        this.player = player;
        this.enemy = enemy;

        this.origPlayerPos = player.lastPos.copy();
        this.origEnemyPos = enemy.lastPos.copy();

        this.player.pos.x = 64;
        this.player.pos.y = 128;
        this.player.direction = 4;
        this.enemy.pos.x = 256 + 64;
        this.enemy.pos.y = 0;
        this.enemy.direction = 2;
        this.player.lock();
        this.enemy.lock();

        // Set to opposite and call round
        this.playersTurn = this.player.stats.spd < this.enemy.stats.spd;
        this.cycle();
        this.battleMenu = this.battleMenu();
    }

    cycle() {
        this.playersTurn = !this.playersTurn;
    }

    battleMenu() {
        return new BattleMenu({
            type: 'Items',
            options: []
        }, {
            type: 'Attack',
            options: [this.player.weapon]
        }, {
            type: 'Spells',
            options: [this.player.spells]
        }, {
            type: 'Other',
            options: ['Defend', 'Run Away']
        });
    }

    update(dt) {

    }

    draw(ctx, width, height) {
        let offset = new Vector(
            width / 2 - 128 - 64,
            height/ 2 - 64 - 64
        );

        ctx.save();
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#FFF';
        ctx.textAlign = "center";
        ctx.restore();

        ctx.save()

        ctx.translate(offset.x, offset.y);

        this.player.draw(ctx);
        this.enemy.draw(ctx);

        ctx.restore();

        this.drawUiBar(ctx);
        this.drawEnemyUiBar(ctx, width, height);

        if (this.playersTurn) {
            this.battleMenu.draw(ctx, offset, this.player);
        }
    }

    drawUiBar(ctx) {
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 512, 48);
        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.fillText("HP : " + this.player.stats.hp, 16, 32);
        ctx.restore();
    }

    drawEnemyUiBar(ctx, width, height) {
        ctx.save();
        ctx.translate(width - 512, 0)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 512, 48);
        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.fillText("HP : " + this.enemy.stats.hp, 16, 32);
        ctx.restore();
    }
}