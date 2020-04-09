import Level from "./Level";
import levels from "./levels/levels";
import Vector from "./Vector";
import StartMenu from "./menu/StartMenu";
import Battle from "./Battle";
import { bus } from "./app";
import Player from "./actors/Player";
import Eventful from "./Eventful";

class Game implements Eventful {
  /**
   * @var {Battle} Battle The current battle taking place
   */
  protected battle: Battle;

  protected level: Level;
  protected levelNumber: number;
  protected menu: StartMenu;
  protected player: Player;
  protected state: string;
  protected states: string[];

  /**
   * Create a new game instance
   */
  constructor() {
    this.levelNumber = 0;

    this.battle = null;
    this.state = "start-menu";

    this.states = ["start-menu", "play", "pause", "inventory", "battle"];

    this.menu = new StartMenu();

    this.player = new Player(new Vector(75, 75), new Vector(36, 64));

    bus.register(this);
  }

  loadLevel(event: any) {
    let match = event.obj.portal_to.match(/^(\d+)\.(\d+)$/);
    let level = levels[parseInt(match[1])][parseInt(match[2])];
    let portal = event.obj;
    this.level.reload(level, portal);
  }

  start() {
    this.level = new Level(levels[0][0], this.player);
  }

  update(dt: number) {
    if (this.menu.active) {
      this.lock("start-menu");
    } else if (this.player.inventory.active) {
      this.lock("inventory");
    } else if (this.battle) {
      if (this.battle.active) {
        this.battle.update(dt);
      } else {
        bus.emit("battleEnd");
      }
    } else {
      this.unlock();
    }

    if (this.state !== "playing") {
      return;
    }

    let events = this.level.update(dt);

    if (events.length) {
      events.forEach((event) => {
        if ((event.type = "enter_portal")) {
          this.loadLevel(event);
        }
      });
    }
  }

  draw(buffer, offset, drawSize) {
    this.level.map.draw(buffer);

    this.level.entities.forEach((entity) => {
      entity.draw(buffer, offset);
    });

    this.level.map.draw(buffer, true);

    if (this.level.player.inventory.active) {
      this.level.player.inventory.draw(buffer, drawSize, offset);
    }

    if (this.hasActiveBattle()) {
      this.battle.draw(buffer, drawSize);
    }

    if (this.menu.active) {
      this.menu.draw(buffer, drawSize, offset);
    }
  }

  lock(state: string) {
    this.state = state;
    this.player.lock();
  }

  unlock() {
    this.player.unlock();
    this.state = "playing";
  }

  register(): object {
    return {
      battleStart: (e) => {
        if (this.battle) {
          return;
        }

        this.battle = new Battle(e.detail.player, e.detail.enemy);
      },

      battleEnd: (e) => {
        this.battle = null;
      },
    };
  }

  getPlayerPosition() {
    return new Vector(this.player.pos.x, this.player.pos.y);
  }

  hasActiveBattle() {
    return this.battle !== null && this.battle.active;
  }
}

export default Game;
