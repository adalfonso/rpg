import { Enemy } from "@/actor/Enemy";
import { HeroTeam } from "@/combat/HeroTeam";
import { Item } from "../inanimate/Item";
import { LevelFixture } from "../level/LevelFixture";
import { Portal } from "../inanimate/Portal";
import { Vector } from "excalibur";
import { bus } from "@/event/EventBus";

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

/** Manages collisions between a player and other fixtures */
class CollisionHandler {
  /** Fixtures that interact with the player */
  private _fixtures: LevelFixture[] = [];

  /**
   * Create a new CollisionHandler instance
   *
   * @param _heroes - center of attention
   */
  constructor(private _heroes: HeroTeam) {}

  /**
   * Load a list of fixtures to manage
   *
   * @param fixtures - target fixtures
   */
  public loadFixtures(fixtures: LevelFixture[]) {
    this._fixtures = fixtures;
  }

  /** Get the current player of the team */
  private get _player() {
    return this._heroes.leader;
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

      if (fixture instanceof Enemy) {
        return this.handleEnemy(fixture);
      } else if (fixture instanceof Portal) {
        return this.handlePortal(fixture);
      } else if (fixture instanceof Item) {
        return this.handleItem(fixture);
      }

      return false;
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
      enemy.fight(this._heroes);
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
      bus.emit("portal.enter", { portal });
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

    bus.emit("item.obtain", { item });
    item.obtain();
    return true;
  }
}

export default CollisionHandler;
