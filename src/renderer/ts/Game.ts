import Battle from "./combat/Battle";
import BattleBuilder from "./combat/BattleBuilder";
import CollisionHandler from "./CollisionHandler";
import Dialogue from "./ui/dialogue/Dialogue";
import HeroTeam from "./combat/HeroTeam";
import Inventory from "./menu/Inventory";
import Level from "./level/Level";
import MissingDataError from "./error/MissingDataError";
import StartMenu from "./menu/StartMenu";
import TextStream from "./ui/dialogue/TextStream";
import Vector from "@common/Vector";
import menus from "./menu/menus";
import { DialogueMediator } from "./ui/dialogue/DialogueMediator";
import { Drawable, Eventful, CallableMap } from "./interfaces";
import { LevelFixtureFactory } from "./level/LevelFixtureFactory";
import { LevelTemplate } from "./level/LevelTemplate";
import { bus } from "@/EventBus";
import { getLevels } from "./level/levels";

/**
 * Different states a game can be in
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
 * Main class to facilitate updates
 *
 * Game hands off rendering to all of the game's constituents.
 */
class Game implements Eventful, Drawable {
  /**
   * The current battle taking place
   */
  private battle: Battle = null;

  /**
   * Current level instance
   */
  private level: Level;

  /**
   * General game dialogue
   *
   * TODO: Refactor this to use the dialogue mediator instead
   */
  private dialogue: Dialogue = null;

  /**
   * Main game menu
   */
  private menu: StartMenu;

  /**
   * Inventory menu
   */
  private inventory: Inventory;

  /**
   * Current state of game
   */
  private state: GameState;

  /**
   * Create a new game instance
   *
   * @param _heroes - main characters
   */
  constructor(
    private _heroes: HeroTeam,
    private _dialogue_mediator: DialogueMediator
  ) {
    this.state = GameState.Play;

    this.menu = new StartMenu(menus.start());
    this.inventory = new Inventory(menus.inventory());

    bus.register(this);

    this.menu.open();
  }

  /** Current player from the team */
  get player() {
    return this._heroes.leader;
  }

  /** Get the focal point that the game revolves around, the player */
  get renderPoint() {
    return this.player.position.copy();
  }

  /**
   * Update the game and underlying entities
   *
   * @param dt - delta time since last update
   */
  public update(dt: number) {
    if (this.battle) {
      this.battle.update(dt);
    }

    if (this.dialogue) {
      this.dialogue.update(dt);
    }

    if (this.dialogue?.isDone) {
      this.dialogue = null;
      this.unlock(GameState.Dialogue);
    }

    if (this.state !== GameState.Play) {
      return;
    }

    this._dialogue_mediator.update(dt);
    this.level.update(dt);
  }

  /**
   * Draw game and all underlying entities
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
    const noOffset = new Vector(0, 0);

    if (this.hasActiveBattle()) {
      const battleOffset = new Vector(
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

    this._dialogue_mediator.draw(ctx, noOffset, resolution);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
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
        this.battle = this.battle || BattleBuilder.create(e);
        this.lock(GameState.Battle);
      },

      "battle.end": (_e: CustomEvent) => {
        this.battle = null;
        this.unlock(GameState.Battle);
      },

      "menu.inventory.open": (_e: CustomEvent) =>
        this.lock(GameState.Inventory),

      "menu.inventory.close": (_e: CustomEvent) =>
        this.unlock(GameState.Inventory),

      "menu.startMenu.open": (_e: CustomEvent) =>
        this.lock(GameState.StartMenu),

      "menu.startMenu.close": (_e: CustomEvent) =>
        this.unlock(GameState.StartMenu),

      "item.obtain": (e: CustomEvent) => {
        const item = e.detail?.item;

        if (!item) {
          throw new MissingDataError(
            `Inventory unable to detect item on "item.obtain" event.`
          );
        }

        const itemName = item.displayAs;

        const useVowel = ["a", "e", "i", "o", "u"].includes(
          itemName[0].toLowerCase()
        );

        const stream = new TextStream([
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
      new LevelTemplate(getLevels().sandbox_0, new LevelFixtureFactory()),
      this.player,
      new CollisionHandler(this._heroes)
    );
  }

  /**
   * Lock player movement when non-play state is requested
   *
   * @param state - the game state to active
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
   * @param state - the game to deactivate
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
   * @return if a battle is underway
   */
  private hasActiveBattle(): boolean {
    return this.battle !== null && this.battle.active;
  }
}

export default Game;
