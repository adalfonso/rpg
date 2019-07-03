import Renderable from "../Renderable";
import PlayerClip from "./PlayerClip";
import NPC from '../actors/NPC';
import Enemy from '../actors/Enemy';
import Portal from "./Portal";
import Vector from "../Vector";
import config from '../config';
import { handler } from '../app';
import Player from "../actors/Player";

export default class Map {

    protected config: object;
    protected data: any;
    protected player: Player;
    protected playerClips: PlayerClip[];
    protected portals: Portal[];
    protected pos: Vector;
    protected renderable: Renderable;
    protected scale: number;
    public enemies: Enemy[];
    public npcs: NPC[];
    public playerStarts: object;

    constructor (data: object, img: string, player: Player) {
        this.data = data;
        this.player = player;
        this.pos = new Vector(0, 0);
        this.scale = config.scale;
        this.config = {};

        this.renderable = new Renderable(img, this.scale, 0, 240, 24, 10, 0);

        this.playerClips = [];
        this.portals = [];
        this.npcs = [];
        this.enemies = [];
        this.playerStarts = {};

        this.data.layers.forEach(layer => {
            if (layer.type !== 'objectgroup') {
                return;
            }

            layer.objects.forEach(obj => {
                let pos: Vector = new Vector(obj.x * this.scale, obj.y * this.scale);
                let size: Vector = new Vector(obj.width * this.scale, obj.height * this.scale);
                let match: boolean = layer.name.match(/^player_start_(\d+\.\d+)$/);

                if (layer.name === 'collision') {
                    this.playerClips.push(new PlayerClip(pos, size));

                } else if (layer.name === 'portal') {
                    this.portals.push(new Portal(pos, size, layer));

                } else if (layer.name === 'npcs') {
                    this.npcs.push(new NPC(obj, player));

                } else if (layer.name === 'enemies') {
                    this.enemies.push(new Enemy(obj));

                } else if (layer.name === 'config') {
                    this.config = obj.properties;

                } else if (match) {
                    this.playerStarts[match[1]] = obj;
                }
            });
        });
    }

    update(dt: number) {
        let events = [];

        this.playerClips.forEach((clip: PlayerClip) => {
            let collision = this.player.collidesWith(clip);

            if (collision) {
                this.player.backstep(collision);
            }
        });

        this.portals.forEach((portal: Portal) => {
            let collision = this.player.collidesWith(portal);

            if (collision) {
               events.push({
                   type: 'enter_portal',
                   obj: portal
               });
            }
        });

        return events;
    }

    draw(ctx:CanvasRenderingContext2D, overPlayer: boolean = false) {
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

            let x: number = 0,
                y: number = 0;

            layer.data.forEach((value, index: number) => {
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

    destruct() {
        this.npcs.forEach(npc => handler.unregister(npc));
    }
}
