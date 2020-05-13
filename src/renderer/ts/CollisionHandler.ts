import Clip from "./inanimates/Clip";
import Enemy from "./actors/Enemy";
import Item from "./inanimates/Item";
import Player from "./actors/Player";
import Portal from "./inanimates/Portal";
import { LevelFixture } from "./LevelTemplate";
import { bus } from "@/EventBus";

/**
 * The CollisionHandler manages collisions between a player and several other
 * fixtures that it may interact with.
 */
class CollisionHandler {
  /**
   * Center of attention
   *
   * @prop {Player} _player
   */
  private _player: Player;

  /**
   * Fixtures that interact with the player
   *
   * @prop {LevelFixture[]} _fixtures
   */
  private _fixtures: LevelFixture[] = [];

  /**
   * Create a new CollisionHandler instance
   *
   * @param {player} player Center of attention
   */
  constructor(player: Player) {
    this._player = player;
  }

  /**
   * Load a list of fixtures to manage
   *
   * @param {LevelFixture[]} fixtures Target fixtures
   */
  public loadFixtures(fixtures: LevelFixture[]) {
    this._fixtures = fixtures;
  }

  /**
   * Update all parties, detect, and manage collisions
   *
   * @param  {number}         dt Delta time
   *
   * @return {LevelFixture[]}    A list of stale fixtures to nix
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
   * @param  {Enemy}   enemy An enemy
   *
   * @return {boolean}       If the enemy is stale
   */
  private handleEnemy(enemy: Enemy): boolean {
    if (enemy.defeated) {
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
   * @param  {Clip}   clip A clip
   *
   * @return {boolean}     If the clip is stale
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
   * @param  {Portal}  portal A portal
   *
   * @return {boolean}        If the portal is stale
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
   * @param  {Item}    item An item
   *
   * @return {boolean}      If the item is stale
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
