import BattleMenu from "./menu/BattleMenu";
import Vector from "./Vector";
import { handler } from './app';
import Player from "./actors/Player";
import Enemy from "./actors/Enemy";

export default class Battle {

    protected player: Player;
    protected enemy: Enemy;
    public active: boolean;
    protected playersTurn: boolean;
    protected battleMenu: BattleMenu;

    constructor(player, enemy) {
        this.active = true;

        this.player = player;
        this.player.savePos();
        this.player.pos.x = 64;
        this.player.pos.y = 128;
        this.player.direction = 4;
        this.player.lock();

        this.enemy = enemy;
        this.enemy.savePos();
        this.enemy.pos.x = 256 + 64;
        this.enemy.pos.y = 0;
        this.enemy.direction = 2;
        this.enemy.lock();

        this.playersTurn = this.player.stats.spd > this.enemy.stats.spd;
        this.battleMenu = this.getBattleMenu();

        handler.register(this);
    }

    cycle() {
        this.playersTurn = !this.playersTurn;

        if (!this.playersTurn) {
           handler.trigger('battleAction', this);
        }
    }

    getBattleMenu(): BattleMenu {
        return new BattleMenu({
            type: 'Items',
            menu: []
        }, {
            type: 'Attack',
            menu: this.player.weapon ? [this.player.weapon] : []
        }, {
            type: 'Spells',
            menu: this.player.spells
        }, {
            type: 'Other',
            menu: ['Defend', 'Run Away']
        });
    }

    update(dt: number) {

    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        let offset: Vector = new Vector(
            width / 2 - 128 - 64,
            height / 2 - 64 - 64
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

    drawUiBar(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 512, 48);
        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.fillText("HP : " + this.player.stats.hp, 16, 32);
        ctx.restore();
    }

    drawEnemyUiBar(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.translate(width - 512, 0)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 512, 48);
        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.fillText("HP : " + this.enemy.stats.hp, 16, 32);
        ctx.restore();
    }

    register(): object {
        return {
            battleAction: e => {
                if (this.playersTurn) {
                    this.player.attack(this.enemy, e.attack);
                } else {
                    this.enemy.attack(this.player);
                }

                if (this.player.stats.hp <= 0) {
                    // Handle death

                } else if (this.enemy.stats.hp <= 0) {
                    this.enemy.defeated = true;

                    this.player.stats.gainExperience(
                        this.enemy.stats.givesExperience
                    );

                    this.player.restorePos();
                    this.enemy.restorePos();

                    this.active = false;

                } else {
                    this.cycle();
                }
            }
        }
    }

    end() {
        this.enemy.defeated = true;
        this.active = false;
    }
}