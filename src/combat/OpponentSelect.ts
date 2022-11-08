import * as ex from "excalibur";
import Team from "./Team";
import { Actor } from "@/actor/Actor";
import { bus, EventType } from "@/event/EventBus";
import { degreesToRadian } from "@/util";

const FONT_SIZE = 28;

const default_options = {
  text: "➧",
  color: ex.Color.fromHex("#00DDDD"),
  font: new ex.Font({
    size: FONT_SIZE,
    unit: ex.FontUnit.Px,
    family: "Minecraftia",
    shadow: {
      offset: ex.vec(2, -2),
      color: ex.Color.fromHex("#333333"),
    },
  }),
};

/**
 * A tool to select which opponent to attack
 *
 * This class allows members of a team to be traversed and targeted for combat.
 * It draws an arrow above their sprite as an indicator.
 */
export class OpponentSelect extends ex.Label {
  /** Currently selected index of the opponents */
  private _index = 0;

  /**
   * Create a new OpponentSelect instance
   *
   * @param _opponents - opponent team members
   */
  constructor(private _opponents: Team<Actor>) {
    super(default_options);

    this.rotation = degreesToRadian(90);
    this._move();

    bus.register(this);
  }

  /** Get the currently selected opponent */
  get selected(): Actor {
    return this._opponents.all()[this._index];
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Keyboard]: {
        keyup: (e: KeyboardEvent) => {
          if (!this.graphics.visible) {
            return;
          }

          switch (e.key) {
            case "ArrowRight":
              return this._next();

            case "ArrowLeft":
              return this._previous();
          }
        },
      },
    };
  }

  /** Hide the selection */
  public hide() {
    this.graphics.visible = false;
  }

  /** Show the selection */
  public show() {
    this.graphics.visible = true;
    this._move();
  }

  /** Select the first non-defeated enemy */
  public resolveSelected() {
    const opponents = this._opponents.all();

    for (let i = 0; i < opponents.length; i++) {
      if (!opponents[i].isDefeated) {
        this._index = i;
        this._move();
        return;
      }
    }
  }

  /** Switch to the next selection */
  private _next() {
    if (this._opponents.areDefeated) {
      return;
    }

    if (this._opponents.hasLastManStanding()) {
      return this.resolveSelected();
    }

    if (this._index === this._opponents.length - 1) {
      this._index = 0;
    } else {
      this._index++;
    }

    if (this.selected.isDefeated) {
      this._next();
    }

    this._move();
  }

  /** Switch to the previous selection */
  private _previous() {
    if (this._opponents.areDefeated) {
      return;
    }

    if (this._opponents.hasLastManStanding()) {
      return this.resolveSelected();
    }

    if (this._index === 0) {
      this._index = this._opponents.length - 1;
    } else {
      this._index--;
    }

    if (this.selected.isDefeated) {
      this._previous();
    }

    this._move();
  }

  /** Moves selector to current entity */
  private _move() {
    const offset = ex.vec(
      Math.round(-default_options.font.size / 3),
      Math.round(-default_options.font.size * 1.5)
    );

    this.pos = this.selected.center.clone().add(offset);
  }
}
