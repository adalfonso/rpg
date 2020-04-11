import Battle from "./Battle";
import Inventory from "./menu/Inventory";
import Level from "./Level";
import Player from "./actors/Player";
import StartMenu from "./menu/StartMenu";
import Vector from "./Vector";
import levels from "./levels/levels";
import { Drawable, Eventful } from "./interfaces";
import { bus } from "./app";

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

    this.menu = new StartMenu();
    this.inventory = new Inventory();
    this.player = new Player(new Vector(75, 75), new Vector(36, 64));

    bus.register(this);

    this.menu.open();
  }

  /**
   * Load a new level instance
   * TODO: define the below game object better, it's too broad.
   *
   * @param {object} event A game event
   */
  private loadLevel(event: any) {
    let match = event.obj.portal_to.match(/^(\d+)\.(\d+)$/);
    let level = levels[parseInt(match[1])][parseInt(match[2])];
    let portal = event.obj;
    this.level.reload(level, portal);
  }

  /**
   * Hacky method to initiate the game at the first level
   * TODO: Create a better way to load a game state instead of a static level
   */
  public start() {
    this.level = new Level(levels[0][0], this.player);
  }

  /**
   * Update the game and underlying entities
   *
   * @param {number} dt Delta time since last update
   */
  update(dt: number) {
    if (this.battle) {
      this.battle.update(dt);
    }

    if (this.state !== GameState.Play) {
      return;
    }

    let events = this.level.update(dt);

    events.forEach((event) => {
      if ((event.type = "enter_portal")) {
        this.loadLevel(event);
      }
    });
  }

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {
    // Draw parts of map behind the player
    this.level.map.draw(ctx);

    this.level.entities.forEach((entity) => {
      entity.draw(ctx, offset, resolution);
    });

    // Draw remaining parts of map above the player
    this.level.map.draw(ctx, true);

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
   * Lock player movement when non-play state is requested
   *
   * @param {GameState} state The game state to active
   */
  lock(state: GameState) {
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
  unlock(state: GameState) {
    if (this.state === state) {
      this.player.unlock();
      this.inventory.unlock();
      this.state = GameState.Play;
    }
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  register(): object {
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
   * Get the focal point that the game revolves around, the player.
   *
   * @returns {Vector} Focal point of the game
   */
  get renderPoint(): Vector {
    return new Vector(this.player.pos.x, this.player.pos.y);
  }

  /**
   * Determine if a battle is underway
   *
   * @return {boolean} If a battle is underway
   */
  hasActiveBattle(): boolean {
    return this.battle !== null && this.battle.active;
  }
}

export default Game;
