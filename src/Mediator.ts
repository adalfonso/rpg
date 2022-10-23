import * as ex from "excalibur";
import MissingDataError from "./error/MissingDataError";
import config from "./config";
import menus from "./menu/menus";
import { DialogueMediator } from "./ui/dialogue/DialogueMediator";
import { Entry } from "./inanimate/Entry";
import { HeroTeam } from "./combat/HeroTeam";
import { Inventory } from "./menu/Inventory";
import { Item } from "./inanimate/Item";
import { LevelFixtureFactory } from "./level/LevelFixtureFactory";
import { MenuType } from "./menu/types";
import { Portal } from "./inanimate/Portal";
import { TiledMapResource as TiledMap } from "@excaliburjs/plugin-tiled";
import { bus, EventType } from "./event/EventBus";
import { createEquipper } from "./combat/EquipperFactory";
import { createSubMenu } from "./menu/MenuFactory";
import { getMapFromName } from "./level/levels";
import { path } from "@tauri-apps/api";
import {
  isLevelFixtureType,
  LevelFixture,
  LevelFixtureType,
} from "./level/LevelFixture";
import { StartMenu } from "./menu/StartMenu";

/** Different states a game can be in */
enum GameState {
  StartMenu,
  Play,
  Pause,
  Inventory,
  Battle,
  Dialogue,
}

/** Coordinates scenes within the game */

// TODO: should this implement lockable
export class Mediator {
  /** Main game menu */
  private _main_menu: StartMenu;

  /** Inventory menu */
  private _inventory: Inventory;

  /** Fixtures in the current scene */
  private _fixtures: LevelFixture[] = [];

  /** Current state of game */
  private _state = GameState.Play;

  /**
   * @param _game - engine instance
   * @param _heroes - all protagonist members
   * @param _dialogue_mediator - coordinates dialogue between actors
   */
  constructor(
    private _game: ex.Engine,
    private _heroes: HeroTeam,
    private _dialogue_mediator: DialogueMediator
  ) {
    bus.register(this);

    this._game.on("postupdate", this._cleanupFixtures.bind(this));

    const { start, inventory } = menus;
    const equipper = createEquipper(this._heroes);

    this._main_menu = new StartMenu(createSubMenu(MenuType.Start)(start()));
    this._inventory = new Inventory(
      createSubMenu(MenuType.Inventory)(inventory()),
      equipper
    );

    this._game.on("preupdate", ({ delta: dt }) => {
      this._dialogue_mediator.update(dt);
    });

    this._game.on("postdraw", (evt) => {
      const { width, height } = this._game.screen.resolution;
      const resolution = ex.vec(width, height);

      this._dialogue_mediator.draw(evt.ctx, resolution);

      if (this._main_menu.active) {
        this._main_menu.draw(evt.ctx, resolution);
      }
    });

    this._main_menu.open();
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
    await this.load("/map/sandbox_0.json");
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

    // If we've already loaded this scene, just go to it
    if (this._game.scenes[scene_name] !== undefined) {
      this._movePlayerToEntry(from ?? "This entry does not exist", scene);
      return this._game.goToScene(scene_name);
    }

    const map = new TiledMap(map_path);

    try {
      await map.load();
    } catch (e) {
      throw new Error(`Failed to load Tiled map "${map_path}": ${e}`);
    }

    map.addTiledMapToScene(scene);

    this._addFixtures(map, scene);

    this._game.add(scene_name, scene);
    this._game.goToScene(scene_name);
    this._game.currentScene.add(this.player);
    this._game.currentScene.camera.strategy.lockToActor(this.player);
    this._game.currentScene.camera.zoom = config.scale;

    if (from) {
      this._movePlayerToEntry(from, scene);
    }
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

    this.player.pos = entry.pos.clone();
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

          bus.emit("dialogue.create", {
            speech: [`Picked up ${useVowel ? "an" : "a"} ${itemName}!`],
          });
        },
      },
    };
  }

  /** Cleanup any stale fixtures once per update*/
  private _cleanupFixtures() {
    const removed = this._fixtures.filter(
      (fixture) => fixture instanceof Item && fixture.obtained
    );

    removed.forEach((fixture) => this._game.currentScene.remove(fixture));

    this._fixtures = this._fixtures.filter(
      (fixture) => !removed.includes(fixture)
    );
  }

  /**
   * Add level fixtures to a scene from a Tiled map
   *
   * @param map - Tiled map
   * @param scene - new scene
   */
  private _addFixtures(map: TiledMap, scene: ex.Scene) {
    const fixture_factory = new LevelFixtureFactory();

    this._fixtures = map.data
      .getExcaliburObjects()
      .filter(({ name }) => isLevelFixtureType(name ?? ""))
      .map(({ name, objects }) => {
        return objects.map((object) => {
          if (object.class === undefined) {
            object.class === name;
          }

          return fixture_factory.create(name as LevelFixtureType, object);
        });
      })
      .flat()
      .filter(Boolean);

    this._fixtures.forEach((fixture) => scene.add(fixture));
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
      this._main_menu.lock();
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
    this._main_menu.unlock();
    this._state = GameState.Play;
  }
}