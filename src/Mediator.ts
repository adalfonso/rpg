import * as ex from "excalibur";
import MissingDataError from "./error/MissingDataError";
import config from "./config";
import { Entry } from "./inanimate/Entry";
import { LevelFixtureFactory } from "./level/LevelFixtureFactory";
import { Player } from "./actor/Player";
import { Portal } from "./inanimate/Portal";
import { TiledMap } from "./TiledMap";
import { bus, EventType } from "./event/EventBus";
import { getMapFromName } from "./level/levels";
import { isLevelFixtureType, LevelFixtureType } from "./level/LevelFixture";
import { path } from "@tauri-apps/api";

/** Coordinates scenes within the game */
export class Mediator {
  /**
   * @param _game - engine instance
   * @param _player - main player instance
   */
  constructor(private _game: ex.Engine, private _player: Player) {
    bus.register(this);
  }

  /**
   * Kickoff the game
   *
   * @param loader - initial file/resource loaded
   */
  public async start(loader: ex.Loader) {
    await this._game.start(loader);
    await this.load("src/_resource/map/sandbox_0.json");
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
    this._game.currentScene.add(this._player);
    this._game.currentScene.camera.strategy.lockToActor(this._player);
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

    this._player.pos = entry.pos.clone();
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
      },
    };
  }

  /**
   * Add level fixtures to a scene from a Tiled map
   *
   * @param map - Tiled map
   * @param scene - new scene
   */
  private _addFixtures(map: TiledMap, scene: ex.Scene) {
    const fixture_factory = new LevelFixtureFactory();

    map.data
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
      .forEach((fixture) => scene.add(fixture));
  }
}
