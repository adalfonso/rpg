import config from '../config';
import Vector from "../Vector";
import Weapon from '../item/Weapon';
import Stats from '../Stats';

class BaseActor {

    public pos: Vector;
    protected lastPos: Vector;
    protected savedPos: Vector;
    protected size: Vector;
    protected direction: number;
    protected savedDirection: number;
    public inDialogue: boolean;
    protected locked: boolean;
    protected weapon: Weapon;
    protected stats: Stats;

    constructor(pos: Vector, size: Vector) {
        this.pos = pos.times(config.scale);
        this.size = size;
        this.direction = 0;
        this.inDialogue = false;
        this.locked = false;
        this.lastPos = pos.copy();
        this.savedPos = pos.copy();
        this.savedDirection = this.direction;
    }

    update(dt: number) {

    }

    draw(ctx: CanvasRenderingContext2D) {
        if (config.debug) {
            this.debugDraw(ctx);
        }

        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y
    }

    debugDraw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#F99';
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        if (!this.inDialogue) {
            this.locked = false;
        }
    }

    // Positioning Methods

    backstep(collision?: { pos: Vector, size: Vector }) {
        let prevCollisionPoint = this.collisionPoint(true);

        if (collision) {
            if (prevCollisionPoint.x < collision.pos.x ||
                prevCollisionPoint.x > collision.pos.x + collision.size.x) {
                this.pos.x = this.lastPos.x;
            } else {
                this.pos.y = this.lastPos.y;
            }
        } else {
            this.pos.x = this.lastPos.x;
            this.pos.y = this.lastPos.y
        }
    }

    collidesWith(entity: BaseActor) {
        let collisionPoint = this.collisionPoint();

        let collision = collisionPoint.x > entity.pos.x &&
            collisionPoint.x < entity.pos.x + entity.size.x &&
            collisionPoint.y > entity.pos.y &&
            collisionPoint.y < entity.pos.y + entity.size.y;

        if (collision) {
            return {
                pos: entity.pos.copy(),
                size: entity.size.copy()
            }
        }

        return false;
    }

    collisionPoint(prev: boolean = false): Vector {
        return new Vector(
            (prev ? this.lastPos.x : this.pos.x) + this.size.x * .5,
            (prev ? this.lastPos.y : this.pos.y) + this.size.y * .8
        );
    }

    savePos() {
        this.savedPos = this.pos.copy();
        this.savedDirection = this.direction;
    }

    restorePos(unlock: boolean = true) {
        this.pos = this.savedPos.copy();
        this.direction = this.savedDirection

        if (unlock) {
            this.unlock();
        }
    }

    // Combat Methods

    attack(target: BaseActor, weapon: Weapon) {
        if (!weapon && this.weapon) {
            weapon = this.weapon;
        }

        let weaponDamage = weapon && weapon.damage ? weapon.damage : 0;
        let damage = this.stats.atk + weaponDamage;

        target.endure(damage);
    }

    endure(damage: number) {
        this.stats.endure(damage);
    }
}

export default BaseActor;