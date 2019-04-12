import Renderable from "../Renderable";
import PlayerClip from "./PlayerClip";

export default class Map {

    constructor (data, img, player) {
        this.data = data;
        this.player = player;
        this.pos = { x: 0, y: 0 };
        this.scale = 2;

        this.renderable = new Renderable(img, this.scale, 0, 240, 24, 10, 0);

        this.playerClips = [];

        this.data.layers.forEach(layer => {
            if (layer.type !== 'objectgroup') {
                return;
            }

            layer.objects.forEach(obj => {
                this.playerClips.push(
                    new PlayerClip(
                        { x: obj.x * this.scale, y: obj.y * this.scale },
                        { x: obj.width * this.scale, y: obj.height * this.scale }
                    )
                );
            });
        });
    }

    update() {

    }

    draw(ctx) {
        this.data.layers.forEach(layer => {
            if (layer.type !== 'tilelayer') {
                return;
            }

            let x = 0, y = 0;

            layer.data.forEach((value, index) => {
                this.renderable.frame = value - 1;

                x = index % layer.width;
                y = Math.floor(index / layer.width);

                ctx.save();
                ctx.translate(
                    this.pos.x + x * this.renderable.subWidth * this.renderable.scale,
                    this.pos.y + y * this.renderable.subHeight * this.renderable.scale
                );

                this.renderable.draw(ctx);

                ctx.restore();
            });

        });

        this.playerClips.forEach(clip => {
            clip.draw(ctx);

            if (clip.collidesWith(this.player)) {
                this.player.resetPos();
            }
        });
    }
}
