import Battle from "@/combat/Battle";
import BattleBuilder from "@/combat/BattleBuilder";
import menus from "@/menu/menus";
import { DialogueMediator } from "../ui/dialogue/DialogueMediator";
import { Drawable, Updatable } from "../interfaces";
import { HeroTeam } from "@/combat/HeroTeam";
import { Inventory } from "../menu/Inventory";
import { LevelFixtureFactory } from "../level/LevelFixtureFactory";
import { MenuType } from "@/menu/types";
import { Nullable } from "../types";
import { StartMenu } from "../menu/StartMenu";
import { Vector } from "excalibur";
import { bus, EventType } from "@/event/EventBus";
import { createEquipper } from "@/combat/EquipperFactory";
import { createSubMenu } from "@/menu/MenuFactory";

/** Different states a game can be in */
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
class Game implements Drawable, Updatable {
  /** The current battle taking place */
  private _battle: Nullable<Battle> = null;

  /** Current level instance */
  private _level: Level;

  /** Main game menu */
  private _menu: StartMenu;

  /** Inventory menu */
  private _inventory: Inventory;

  /** Current state of game */
  private _state: GameState;

  /**
   * Create a new game instance
   *
   * @param _heroes - main characters
   */
  constructor(
    private _heroes: HeroTeam,
    private _dialogue_mediator: DialogueMediator
  ) {
    this._state = GameState.Play;

    const { start, inventory } = menus;
    const equipper = createEquipper(_heroes);

    this._menu = new StartMenu(createSubMenu(MenuType.Start)(start()));
    this._inventory = new Inventory(
      createSubMenu(MenuType.Inventory)(inventory()),
      equipper
    );

    bus.register(this);

    this._menu.open();

    this._level = new Level(
      new LevelTemplate(getLevels().sandbox_0, new LevelFixtureFactory()),
      this.player,
      new CollisionHandler(this._heroes)
    );
  }

  /** Current player from the team */
  get player() {
    return this._heroes.leader;
  }

  /** Get the focal point that the game revolves around, the player */
  get renderPoint() {
    return this.player.position.clone();
  }

  /**
   * Update the game and underlying entities
   *
   * @param dt - delta time since last update
   */
  public update(dt: number) {
    if (this._battle) {
      this._battle.update(dt);
    }

    this._dialogue_mediator.update(dt);

    if (this._state !== GameState.Play) {
      return;
    }

    this._level.update(dt);
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
    const noOffset = Vector.Zero;

    if (this._battle !== null && this._battle.active) {
      const battleOffset = new Vector(
        resolution.x / 2 - 128 - 64,
        resolution.y / 2 - 64 - 64
      );
      this._battle.draw(ctx, battleOffset, resolution);
    } else if (this._inventory.active) {
      this._inventory.draw(ctx, noOffset, resolution);
    } else {
      this._level.draw(ctx, offset, resolution);
    }

    this._menu.draw(ctx, noOffset, resolution);
    this._dialogue_mediator.draw(ctx, noOffset, resolution);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Custom]: {
        "battle.start": (e: CustomEvent) => {
          /**
           * TODO: in the future, check if a battle will ever be started while
           * another battle is already underway. If an enemy jumps on the player
           * during a battle animation, it is plausible that battle.start would
           * occur.
           */
          this._battle = this._battle || BattleBuilder.create(e);
          this.lock(GameState.Battle);
        },

        "battle.end": (_: CustomEvent) => {
          this._battle = null;
          this.unlock(GameState.Battle);
        },

        "dialogue.start": (_: CustomEvent) => this.lock(GameState.Dialogue),

        "dialogue.end": (_: CustomEvent) => this.unlock(GameState.Dialogue),

        "menu.inventory.open": (_: CustomEvent) =>
          this.lock(GameState.Inventory),

        "menu.inventory.close": (_: CustomEvent) =>
          this.unlock(GameState.Inventory),

        "menu.startMenu.open": (_: CustomEvent) =>
          this.lock(GameState.StartMenu),

        "menu.startMenu.close": (_: CustomEvent) =>
          this.unlock(GameState.StartMenu),
      },
    };
  }

  /**
   * Lock player movement when non-play state is requested
   *
   * @param state - the game state to active
   */
  private lock(state: GameState) {
    if (this._state !== GameState.Play) {
      return;
    }

    this._state = state;
    this.player.lock();

    if (state !== GameState.Inventory) {
      this._inventory.lock();
    }

    if (state !== GameState.StartMenu) {
      this._menu.lock();
    }
  }

  /**
   * Unlock player movement if a current state is active
   *
   * @param state - the game to deactivate
   */
  private unlock(state: GameState) {
    if (this._state !== state) {
      return;
    }
    this.player.unlock();
    this._inventory.unlock();
    this._menu.unlock();
    this._state = GameState.Play;
  }
}

export default Game;
