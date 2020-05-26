import Battle from "./combat/Battle";
import CollisionHandler from "./CollisionHandler";
import Dialogue from "./ui/Dialogue";
import HeroTeam from "./combat/HeroTeam";
import Inventory from "./menu/Inventory";
import Level from "./Level";
import LevelTemplate from "./LevelTemplate";
import MissingDataError from "./error/MissingDataError";
import Player from "./actors/Player";
import StartMenu from "./menu/StartMenu";
import Team from "./combat/Team";
import TextStream from "./ui/TextStream";
import Vector from "@common/Vector";
import levels from "./levels/levels";
import { Drawable, Eventful, CallableMap } from "./interfaces";
import { bus } from "@/EventBus";
import { menus } from "./config";

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
  Dialogue,
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
   *
   * @prop {Level} level
   */
  private level: Level;

  /**
   * General game dialogue
   *
   * @prop {Dialogue} dialogue
   */
  private dialogue: Dialogue = null;

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
   *
   * @param {Player} player Main player instance
   */
  constructor(player: Player) {
    this.state = GameState.Play;

    this.menu = new StartMenu(menus.startMenu);
    this.inventory = new Inventory(menus.inventory);

    this.player = player;

    bus.register(this);

    this.menu.open();
  }

  /**
   * Get the focal point that the game revolves around, the player.
   *
   * @returns {Vector} Focal point of the game
   */
  get renderPoint(): Vector {
    return this.player.position.copy();
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

    if (this.dialogue) {
      this.dialogue.update(dt);
    }

    if (this.dialogue?.done) {
      this.dialogue = null;
      this.unlock(GameState.Dialogue);
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
    let noOffset = new Vector(0, 0);

    if (this.hasActiveBattle()) {
      let battleOffset = new Vector(
        resolution.x / 2 - 128 - 64,
        resolution.y / 2 - 64 - 64
      );
      this.battle.draw(ctx, battleOffset, resolution);
    } else if (this.inventory.active) {
      this.inventory.draw(ctx, noOffset, resolution);
    } else {
      this.level.draw(ctx, offset, resolution);
    }

    this.menu.draw(ctx, noOffset, resolution);

    if (this.dialogue) {
      this.dialogue.draw(ctx, noOffset, resolution);
    }
  }

  /**
   * Register events with the event bus
   *
   * @return {CallableMap} Events to register
   */
  public register(): CallableMap {
    return {
      "battle.start": (e: CustomEvent) => {
        /**
         * TODO: in the future, check if a battle will ever be started while
         * another battle is already underway. If an enemy jumps on the player
         * during a battle animation, it is plausible that battle.start would
         * occur.
         */
        this.battle =
          this.battle ||
          new Battle(
            new HeroTeam([e.detail.player]),
            new Team([e.detail.enemy])
          );
        this.lock(GameState.Battle);
      },

      "battle.end": (e: CustomEvent) => {
        this.battle = null;
        this.unlock(GameState.Battle);
      },

      "menu.inventory.open": (e: CustomEvent) => this.lock(GameState.Inventory),
      "menu.inventory.close": (e: CustomEvent) =>
        this.unlock(GameState.Inventory),
      "menu.startMenu.open": (e: CustomEvent) => this.lock(GameState.StartMenu),
      "menu.startMenu.close": (e: CustomEvent) =>
        this.unlock(GameState.StartMenu),
      "item.obtain": (e: CustomEvent) => {
        let item = e.detail?.item;

        if (!item) {
          throw new MissingDataError(
            `Inventory unable to detect item on "item.obtain" event.`
          );
        }

        let itemName = item.displayAs;

        let useVowel = ["a", "e", "i", "o", "u"].includes(
          itemName[0].toLowerCase()
        );

        let stream = new TextStream([
          `Picked up ${useVowel ? "an" : "a"} ${itemName}!`,
        ]);

        this.dialogue = new Dialogue(stream, undefined, [this.player]);
        this.lock(GameState.Dialogue);
      },
    };
  }

  /**
   * Hacky method to initiate the game at the first level
   * TODO: Create a better way to load a game state instead of a static level
   */
  public start() {
    this.level = new Level(
      new LevelTemplate(levels.sandbox_0),
      this.player,
      new CollisionHandler(this.player)
    );
  }

  /**
   * Lock player movement when non-play state is requested
   *
   * @param {GameState} state The game state to active
   */
  private lock(state: GameState) {
    if (this.state !== GameState.Play) {
      return;
    }

    this.state = state;
    this.player.lock();

    if (state !== GameState.Inventory) {
      this.inventory.lock();
    }

    if (state !== GameState.StartMenu) {
      this.menu.lock();
    }
  }

  /**
   * Unlock player movement if a current state is active
   *
   * @param {GameState} state The game to deactivate
   */
  private unlock(state: GameState) {
    if (this.state !== state) {
      return;
    }
    this.player.unlock();
    this.inventory.unlock();
    this.menu.unlock();
    this.state = GameState.Play;
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
