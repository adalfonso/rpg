import Renderable from "../Renderable";
import PlayerClip from "./PlayerClip";
import Portal from "./Portal";
import Vector from "../Vector";
import config from '../config';

export default class Map {

    constructor (data, img, player) {
        this.data = data;
        this.player = player;
        this.pos = { x: 0, y: 0 };
        this.scale = config.scale;
        this.config = {};

        this.renderable = new Renderable(img, this.scale, 0, 240, 24, 10, 0);

        this.playerClips = [];
        this.portals = [];
        this.playerStarts = {};

        this.data.layers.forEach(layer => {
            if (layer.type !== 'objectgroup') {
                return;
            }

            layer.objects.forEach(obj => {
                let pos = new Vector(obj.x * this.scale, obj.y * this.scale);
                let size = new Vector(obj.width * this.scale, obj.height * this.scale);
                let match = layer.name.match(/^player_start_(\d+\.\d+)$/);

                if (layer.name === 'collision') {
                    this.playerClips.push(new PlayerClip(pos, size));

                } else if (layer.name === 'portal') {
                    this.portals.push(new Portal(pos, size, layer));

                } else if (layer.name === 'config') {
                    this.config = this.obj.properties;

                } else if (match) {
                    this.playerStarts[match[1]] = obj;
                }
            });
        });
    }

    update(dt) {
        let events = [];

        this.playerClips.forEach(clip => {
            let collision = clip.collidesWith(this.player);

            if (collision) {
                this.player.resetPos(collision);
            }
        });

        this.portals.forEach(portal => {
            let collision = portal.collidesWith(this.player);

            if (collision) {
               events.push({
                   type: 'enter_portal',
                   obj: portal
               });
            }
        });

        return events;
    }

    draw(ctx, overPlayer = false) {
        this.data.layers.forEach(layer => {
            if (layer.type !== 'tilelayer') {
                return;
            }

            if (overPlayer && layer.name !== 'above_player') {
                return;
            }

            if (!overPlayer && layer.name === 'above_player') {
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
    }
}
