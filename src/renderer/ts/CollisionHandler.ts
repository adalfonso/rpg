import Clip from "./inanimate/Clip";
import Enemy from "./actor/Enemy";
import Item from "./inanimate/Item";
import Player from "./actor/Player";
import Portal from "./inanimate/Portal";
import Vector from "@common/Vector";
import { LevelFixture } from "./level/LevelTemplate";
import { bus } from "@/EventBus";

/**
 * Collision information with another entity
 *
 * @prop position - position of the entity that caused the collision
 * @prop size     - size of the entity that caused the collision
 */
export type Collision = {
  position: Vector;
  size: Vector;
};

/**
 * Manages collisions between a player and other fixtures
 */
class CollisionHandler {
  /**
   * Fixtures that interact with the player
   */
  private _fixtures: LevelFixture[] = [];

  /**
   * Create a new CollisionHandler instance
   *
   * @param _player - center of attention
   */
  constructor(private _player: Player) {}

  /**
   * Load a list of fixtures to manage
   *
   * @param fixtures - target fixtures
   */
  public loadFixtures(fixtures: LevelFixture[]) {
    this._fixtures = fixtures;
  }

  /**
   * Update all parties, detect, and manage collisions
   *
   * @param dt - delta time
   *
   * @return a list of stale fixtures to nix
   */
  public update(dt: number): LevelFixture[] {
    this._player.update(dt);

    return this._fixtures.filter((fixture) => {
      fixture.update(dt);

      switch (fixture.constructor.name) {
        case "Enemy":
          return this.handleEnemy(<Enemy>fixture);
        case "Clip":
          return this.handleClip(<Clip>fixture);
        case "Portal":
          return this.handlePortal(<Portal>fixture);
        case "Item":
          return this.handleItem(<Item>fixture);
        default:
          return false;
      }
    });
  }

  /**
   * Handle enemy collisions
   *
   * @param enemy - an enemy
   *
   * @return if the enemy is stale
   */
  private handleEnemy(enemy: Enemy): boolean {
    if (enemy.isDefeated) {
      return true;
    }

    if (enemy.collidesWith(this._player)) {
      enemy.fight(this._player);
    }

    return false;
  }

  /**
   * Handle clip collisions
   *
   * @param clip - a clip
   *
   * @return if the clip is stale
   */
  private handleClip(clip: Clip): boolean {
    let collision = this._player.collidesWith(clip);

    if (collision) {
      this._player.backstep(collision);
    }

    return false;
  }

  /**
   * Handle portal collisions
   *
   * @param portal - a portal
   *
   * @return if the portal is stale
   *
   * @emits portal.enter
   */
  private handlePortal(portal: Portal): boolean {
    if (this._player.collidesWith(portal)) {
      bus.emit("portal.enter", { portal: portal });
    }

    return false;
  }

  /**
   * Handle item collisions
   *
   * @param item - an item
   *
   * @return if the item is stale
   *
   * @emits item.obtain
   */
  private handleItem(item: Item): boolean {
    if (!this._player.collidesWith(item)) {
      return false;
    }

    bus.emit("item.obtain", { item: item });
    item.obtain();
    return true;
  }
}

export default CollisionHandler;
