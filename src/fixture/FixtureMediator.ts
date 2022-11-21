import * as ex from "excalibur";
import { FixtureFactory } from "./FixtureFactory";
import { Item } from "@/inanimate/Item";
import { NonPlayer } from "@/actor/NonPlayer";
import { TiledMapResource as TiledMap } from "@excaliburjs/plugin-tiled";
import { bus } from "@/event/EventBus";
import {
  FixtureType,
  isFixtureType,
  isLevelFixture,
  LevelFixture,
} from "./Fixture";

/** Coordinates creation and cleanup of level fixtures */
export class FixtureMediator {
  /** Fixtures in the current scene */
  private _fixtures: LevelFixture[] = [];

  /**
   * @param _game - game engine instance
   */
  constructor(private _game: ex.Engine) {}

  /**
   * Add level fixtures to a scene from a Tiled map
   *
   * @param map - Tiled map
   * @param scene - new scene
   */
  public async add(map: TiledMap, scene: ex.Scene) {
    const fixture_factory = new FixtureFactory();

    const fixtures = await Promise.all(
      map.data
        .getExcaliburObjects()
        .filter(({ name }) => isFixtureType(name ?? ""))
        .map(({ name, objects }) => {
          return objects.map((object) => {
            if (object.class === undefined) {
              object.class === name;
            }

            return fixture_factory.create(name as FixtureType, object);
          });
        })
        .flat()
    );

    this._fixtures = fixtures.filter(isLevelFixture);

    this._fixtures.forEach(async (fixture) => {
      if ("init" in fixture) {
        await fixture.init();
      }

      scene.add(fixture);
    });
  }

  public get all() {
    return this._fixtures;
  }

  /** Clear out all fixtures */
  public clear() {
    this._fixtures.forEach((fixture) => bus.unregister(fixture));
    this._fixtures = [];
  }

  /** Clean up stale fixtures (once per turn) */
  public clean() {
    const removed = this._fixtures.filter(
      (fixture) =>
        (fixture instanceof Item && fixture.obtained) ||
        (fixture instanceof NonPlayer && fixture.isExpired)
    );

    removed.forEach((fixture) => this._game.remove(fixture));

    this._fixtures = this._fixtures.filter(
      (fixture) => !removed.includes(fixture)
    );
  }
}
