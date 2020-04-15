import Battle from "./Battle";
import Inventory from "./menu/Inventory";
import Level from "./Level";
import Player from "./actors/Player";
import StartMenu from "./menu/StartMenu";
import Vector from "./Vector";
import levels from "./levels/levels";
import { Drawable, Eventful } from "./interfaces";
import { bus } from "./app";
import { menus, weapons } from "./config";
import Weapon from "./item/Weapon";

/**
 * Different states a game can be in
 *
 * @prop {GameState} GameState
 */
enum GameState {
  StartMenu,
  Play,
  Pause,
  Inventory,
  Battle,
}

/**
 * Game is the main class to facilitate updates, handing off rendering to all
 * of the game's constituents, and basic state management.
 */
class Game implements Eventful, Drawable {
  /**
   * The current battle taking place
   *
   * @prop {Battle} Battle
   */
  private battle: Battle = null;

  /**
   * Current level instance
   * @prop {Level} level
   */
  private level: Level;

  /**
   * Main game menu
   *
   * @prop {StartMenu} menu
   */
  private menu: StartMenu;

  /**
   * Inventory menu
   *
   * @prop {Inventory} inventory
   */
  private inventory: Inventory;

  /**
   * Main player instance
   *
   * @prop {Player} player
   */
  private player: Player;

  /**
   * Current state of game
   *
   * @prop {GameState} state
   */
  private state: GameState;

  /**
   * Create a new game instance
   */
  constructor() {
    this.state = GameState.Play;

    this.menu = new StartMenu(menus.startMenu);
    this.inventory = new Inventory(menus.inventory);

    // TODO: When game state can be saved, move this into a game loading class
    weapons.forEach((weapon) => {
      this.inventory.store(new Weapon(weapon));
    });

    this.player = new Player(new Vector(75, 75), new Vector(36, 64));

    bus.register(this);

    this.menu.open();
  }

  /**
   * Get the focal point that the game revolves around, the player.
   *
   * @returns {Vector} Focal point of the game
   */
  get renderPoint(): Vector {
    return new Vector(this.player.pos.x, this.player.pos.y);
  }

  /**
   * Update the game and underlying entities
   *
   * @param {number} dt Delta time since last update
   */
  public update(dt: number) {
    if (this.battle) {
      this.battle.update(dt);
    }

    if (this.state !== GameState.Play) {
      return;
    }

    this.level.update(dt);
  }

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    this.level.draw(ctx, offset, resolution);

    if (this.hasActiveBattle()) {
      let battleOffset = new Vector(
        resolution.x / 2 - 128 - 64,
        resolution.y / 2 - 64 - 64
      );
      this.battle.draw(ctx, battleOffset, resolution);
    }

    this.menu.draw(ctx, offset, resolution);

    this.inventory.draw(ctx, offset, resolution);
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  public register(): object {
    return {
      "battle.start": (e) => {
        /**
         * TODO: in the future, check if a battle will ever be started while
         * another battle is already underway. If an enemy jumps on the player
         * during a battle animation, it is plausible that battle.start would
         * occur.
         */
        this.battle =
          this.battle || new Battle(e.detail.player, e.detail.enemy);
        this.lock(GameState.Battle);
      },

      "battle.end": (e) => {
        this.battle = null;
        this.unlock(GameState.Battle);
      },

      "menu.inventory.open": (e) => this.lock(GameState.Inventory),
      "menu.inventory.close": (e) => this.unlock(GameState.Inventory),
      "menu.startMenu.open": (e) => this.lock(GameState.StartMenu),
      "menu.startMenu.close": (e) => this.unlock(GameState.StartMenu),
    };
  }

  /**
   * Hacky method to initiate the game at the first level
   * TODO: Create a better way to load a game state instead of a static level
   */
  public start() {
    this.level = new Level(levels[0][0], this.player);
  }

  /**
   * Lock player movement when non-play state is requested
   *
   * @param {GameState} state The game state to active
   */
  private lock(state: GameState) {
    if (this.state === GameState.Play) {
      this.state = state;
      this.player.lock();

      if (state !== GameState.Inventory) {
        this.inventory.lock();
      }
    }
  }

  /**
   * Unlock player movement if a current state is active
   *
   * @param {GameState} state The game to deactivate
   */
  private unlock(state: GameState) {
    if (this.state === state) {
      this.player.unlock();
      this.inventory.unlock();
      this.state = GameState.Play;
    }
  }

  /**
   * Determine if a battle is underway
   *
   * @return {boolean} If a battle is underway
   */
  private hasActiveBattle(): boolean {
    return this.battle !== null && this.battle.active;
  }
}

export default Game;
