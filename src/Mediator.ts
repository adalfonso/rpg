import * as ex from "excalibur";
import Battle from "./combat/Battle";
import BattleBuilder from "./combat/BattleBuilder";
import MissingDataError from "./error/MissingDataError";
import { DialogueMediator } from "./ui/dialogue/DialogueMediator";
import { Enemy } from "./actor/Enemy";
import { Entry } from "./inanimate/Entry";
import { FixtureMediator } from "./fixture/FixtureMediator";
import { HeroTeam } from "./combat/HeroTeam";
import { MenuList } from "./menu/MenuFactory";
import { Portal } from "./inanimate/Portal";
import { TiledMapResource as TiledMap } from "@excaliburjs/plugin-tiled";
import { bus, EventType } from "./event/EventBus";
import { getMapFromName, scale } from "./util";
import { path } from "@tauri-apps/api";

/** Different states a game can be in */
enum GameState {
  StartMenu,
  Play,
  Pause,
  Inventory,
  Battle,
  Dialogue,
}

const FALLBACK_LEVEL = "/map/sandbox_0.json";
const BATTLE_SCENE_NAME = "_battle";

/** Coordinates scenes within the game */
export class Mediator {
  /** Current state of game */
  private _state = GameState.Play;

  /** Saved scene name */
  private _saved_scene = "";

  /**
   * @param _game - engine instance
   * @param _heroes - all protagonist members
   * @param _dialogue_mediator - coordinates dialogue between actors
   * @param _menus - list of menus needed, (start, inventory)
   * @param _fixtures - fixture mediator
   */
  constructor(
    private _game: ex.Engine,
    private _heroes: HeroTeam,
    private _dialogue_mediator: DialogueMediator,
    private _menus: MenuList,
    private _fixtures: FixtureMediator
  ) {
    bus.register(this);

    this._game.on("preupdate", this._onPreUpdate.bind(this));
    this._game.on("postupdate", this._onPostUpdate.bind(this));
    this._game.on("predraw", this._onPreDraw.bind(this));
    this._game.on("postdraw", this._onPostDraw.bind(this));

    this._menus.start.open();
  }

  /** Current player from the team */
  get player() {
    return this._heroes.leader;
  }

  /**
   * Kickoff the game
   *
   * @param loader - initial file/resource loaded
   */
  public async start(loader: ex.Loader) {
    await this._game.start(loader);
    await this.load(FALLBACK_LEVEL);
  }

  /**
   * Load a new scene
   *
   * @param map_path - file location for the next map
   * @param from - map name where the player is coming from
   */
  public async load(map_path: string, from?: string) {
    const scene_name = (await path.basename(map_path)).replace(/\..+$/, "");
    const scene = this._game.scenes[scene_name] ?? new ex.Scene();

    this._removeCurrentLevel();

    const map = new TiledMap(map_path);

    try {
      await map.load();
    } catch (e) {
      throw new Error(`Failed to load Tiled map "${map_path}": ${e}`);
    }

    map.addTiledMapToScene(scene);

    await this._fixtures.add(map, scene);

    const origin = this._fixtures.all.find(
      (fixture) => fixture instanceof Entry && fixture.name === "origin"
    );

    this._game.add(scene_name, scene);
    this._game.goToScene(scene_name);
    this._game.currentScene.add(this.player);
    this.player.pet && this._game.currentScene.add(this.player.pet);
    this._game.currentScene.camera.strategy.lockToActor(this.player);
    this._game.currentScene.camera.zoom = scale();

    if (from) {
      this._movePlayerToEntry(from, scene);
    } else if (origin) {
      this.player.moveTo(origin.pos.clone());
    }
  }

  /**
   * Remove current level information from the mediator
   *
   * We will not persist level info (fixtures) on the mediator because we don't
   * want to them handle events by accident. Additionally we will remove the
   * scene from the game since it is performant enough to recreate it on the
   * fly.
   */
  private _removeCurrentLevel() {
    this._fixtures.clear();
    this._game.remove(this._game.currentScene);
  }

  /**
   * Locate the "from" entry and move the player there
   *
   * @param from - map name where the player came from
   * @param scene - new scene
   */
  private _movePlayerToEntry(from: string, scene: ex.Scene) {
    const entry = scene.actors.filter(
      (actor) => actor instanceof Entry && actor.ref === from
    )[0];

    if (entry === undefined) {
      throw new MissingDataError(
        `Traveling from ${from} but could not locate Entry`
      );
    }

    this.player.moveTo(entry.pos.clone());
    this.player.pet?.moveTo(entry.pos.clone(), true);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Custom]: {
        "portal.enter": (e: CustomEvent) => {
          const portal = e.detail?.portal;

          if (!(portal instanceof Portal)) {
            throw new MissingDataError(
              `Could not find portal during "portal.enter"`
            );
          }

          this.load(getMapFromName(portal.to), portal.from);
        },

        "battle.start": async (e: CustomEvent) => {
          if (!(e.detail.enemy instanceof Enemy)) {
            throw new MissingDataError(
              `Missing enemy when creating a battle from an event.`
            );
          }

          // TODO: Fix this. It happens when the player collides with an enemy
          // during battle. Check Enemy class for collision event.
          if (this._game.currentScene instanceof Battle) {
            console.warn(
              "Trying to start a battle but one is currently underway"
            );

            return;
          }

          /**
           * TODO: in the future, check if a battle will ever be started while
           * another battle is already underway. If an enemy jumps on the player
           * during a battle animation, it is plausible that battle.start would
           * occur.
           */

          const battle = await BattleBuilder.create(
            this._heroes,
            e.detail.enemy,
            this._game
          );

          this._saveCurrentScene();
          this._game.add(BATTLE_SCENE_NAME, battle);
          this._game.goToScene(BATTLE_SCENE_NAME);
          this._game.currentScene.camera.zoom = scale();
          this._lock(GameState.Battle);
        },

        "battle.end": (_: CustomEvent) => {
          this._restoreScene();
          this._game.removeScene(BATTLE_SCENE_NAME);

          this._unlock(GameState.Battle);
        },

        "dialogue.start": (_: CustomEvent) => this._lock(GameState.Dialogue),

        "dialogue.end": (_: CustomEvent) => this._unlock(GameState.Dialogue),

        "menu.inventory.open": (_: CustomEvent) =>
          this._lock(GameState.Inventory),

        "menu.inventory.close": (_: CustomEvent) =>
          this._unlock(GameState.Inventory),

        "menu.startMenu.open": (_: CustomEvent) =>
          this._lock(GameState.StartMenu),

        "menu.startMenu.close": (_: CustomEvent) =>
          this._unlock(GameState.StartMenu),
      },
    };
  }

  /** Save the current scene for a restore later on */
  private _saveCurrentScene() {
    const scenes = Object.entries(this._game.scenes).filter(
      ([_name, scene]) => scene === this._game.currentScene
    );

    if (scenes.length === 0) {
      console.warn("Tried to save scene but could not find the name");
      return;
    }

    this._saved_scene = scenes[0][0];
  }

  /** Restore a saved scene */
  private _restoreScene() {
    if (this._saved_scene === "") {
      throw new MissingDataError(
        "Tried to restore scene but saved scene is empty"
      );
    }

    this._game.goToScene(this._saved_scene);
    this._saved_scene = "";
  }

  /**
   * Handle Excalibur pre-update
   *
   * @param evt - pre-update event
   */
  private _onPreUpdate(evt: ex.PreUpdateEvent<ex.Engine>) {
    this._dialogue_mediator.update(evt.delta);
  }

  /**
   * Handle Excalibur post-update
   *
   * @param evt - post-update event
   */
  private _onPostUpdate(_evt: ex.PostUpdateEvent<ex.Engine>) {
    this._fixtures.clean();
  }

  /**
   * Handle Excalibur pre-update
   *
   * @param evt - pre-draw event
   */
  private _onPreDraw(evt: ex.PreDrawEvent) {
    const { width, height } = this._game.screen.resolution;
    const resolution = ex.vec(width, height);

    if (this._game.currentScene instanceof Battle) {
      this._game.currentScene.drawPre(evt.ctx, resolution);
    }
  }

  /**
   * Handle Excalibur post-draw
   *
   * @param evt - post-draw event
   */
  private _onPostDraw(evt: ex.PostDrawEvent) {
    const { width, height } = this._game.screen.resolution;
    const resolution = ex.vec(width, height);

    this._dialogue_mediator.draw(evt.ctx, resolution);

    if (this._menus.start.active) {
      this._menus.start.draw(evt.ctx, resolution);
    }

    if (this._menus.inventory.active) {
      this._menus.inventory.draw(evt.ctx, resolution);
    }

    if (this._game.currentScene instanceof Battle) {
      this._game.currentScene.drawPost(evt.ctx, resolution);
    }
  }

  /**
   * Lock player movement when non-play state is requested
   *
   * @param state - the game state to active
   */
  private _lock(state: GameState) {
    if (this._state !== GameState.Play) {
      return;
    }

    this._state = state;
    this.player.lock();

    if (state !== GameState.Inventory) {
      this._menus.inventory.lock();
    }

    if (state !== GameState.StartMenu) {
      this._menus.start.lock();
    }
  }

  /**
   * Unlock player movement if a current state is active
   *
   * @param state - the game to deactivate
   */
  private _unlock(state: GameState) {
    if (this._state !== state) {
      return;
    }
    this.player.unlock();
    this._menus.inventory.unlock();
    this._menus.start.unlock();
    this._state = GameState.Play;
  }
}
