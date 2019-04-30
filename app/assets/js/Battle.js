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
    }

    update(dt) {

    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#FFF';
        ctx.textAlign = "center";
        ctx.restore();

        ctx.save()

        ctx.translate(
            width / 2 - 128 - 64,
            height/ 2 - 64 - 64
        );

        this.player.draw(ctx);
        this.enemy.draw(ctx);

        ctx.restore()
    }
}