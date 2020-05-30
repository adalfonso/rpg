import Actor from "./Actor";
import Player from "./Player.js";
import Renderable from "@/Renderable";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import { Drawable } from "@/interfaces";
import { bus } from "@/EventBus";

/**
 * Main class for baddies
 */
class Enemy extends Actor implements Drawable {
  /**
   * Each sprite of the enemy's movement animation
   */
  private sprites: Renderable[];

  /**
   * If the enemy has been defeated
   */
  public defeated: boolean;

  /**
   * Create a new Enemy instance
   *
   * @param data - info about the enemy
   */
  constructor(data: any) {
    super(
      new Vector(data.x, data.y),
      new Vector(data.width, data.height),
      data
    );

    this.direction = 4;
    this.defeated = false;

    let { fps, ratio, scale, sprite } = this.getUiInfo();

    this.sprites = [
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
      new Renderable(sprite, scale, 0, 8, ratio, fps),
    ];

    this.resolveState(`enemies.${this.id}`);
  }

  /**
   * Get the string reference to the team type
   */
  get teamType() {
    return this.config?.teamType;
  }

  /**
   * Update the enemy
   *
   * @param dt - delta time
   */
  public update(dt: number) {}

  /**
   * Draw Enemy and all underlying entities
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (this.defeated) {
      return;
    }

    super.draw(ctx, offset, resolution);

    this.sprites[this.direction].draw(ctx, this.position.plus(offset));
  }

  /**
   * Make a clone of the enemy
   *
   * @return the clone
   */
  public clone(): Enemy {
    return new Enemy(this.data);
  }

  /**
   * Start a fight with the player
   *
   * @param player - player to fight
   *
   * @emits battle.start
   */
  public fight(player: Player) {
    if (this.defeated) {
      return;
    }

    bus.emit("battle.start", {
      player: player,
      enemy: this,
    });
  }

  /**
   * Kill off the enemy
   */
  public kill() {
    this.defeated = true;

    StateManager.getInstance().mergeByRef(`enemies.${this.id}.defeated`, true);
  }

  /**
   * Resolve the current state of the enemy in comparison to the game state
   *
   * @param ref - reference to where in the state the enemy is stored
   *
   * @return enemy data as stored in the state
   */
  protected resolveState(ref: string): any {
    let stateManagerData = super.resolveState(ref);

    if (stateManagerData?.defeated) {
      this.defeated = stateManagerData.defeated;
    }

    return stateManagerData;
  }

  /**
   * Get current state of the enemy for export to a state manager
   *
   * @return current state of the enemy
   */
  protected getState(): object {
    return { ...super.getState(), defeated: this.defeated };
  }
}

export default Enemy;
