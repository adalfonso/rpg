import Actor from "./Actor";
import MissingDataError from "@/error/MissingDataError";
import Vector from "@common/Vector";
import { Drawable, Eventful, CallableMap } from "@/interfaces";
import { Milestone } from "@/state/milestone/Milestone";
import { MilestoneAttainOn } from "@/state/milestone/types";
import { Speech } from "./types";
import { bus } from "@/EventBus";
import { getSpeech } from "./speech";
import {
  LevelFixtureTemplate,
  levelPropertyLookup,
} from "@/level/LevelFixture";

/** A non-playable character */
class NonPlayer extends Actor implements Eventful, Drawable {
  /** Entities that were recently collided with */
  private collisions: Actor[] = [];

  /** Speech/dialogue spoken by the npc */
  private _speech: Speech;

  /** Milestones tied to the npc */
  private _milestone: Milestone;

  /** If the npc is expired and should be torn down */
  private _is_expired = false;

  /**
   * Create a new NonPlayer instance
   *
   * TODO: handle sprites when they are available
   *
   * @param _position - the non-player's position
   * @param _size - the non-player's size
   * @param template - info about the non-player
   */
  constructor(
    _position: Vector,
    _size: Vector,
    template: LevelFixtureTemplate
  ) {
    super(_position, _size, template);
    const { type, name, properties } = template;
    const speech_key = `${type}.${name}`;

    this._speech = getSpeech(speech_key);

    if (this._speech === undefined) {
      throw new MissingDataError(
        `Speech data for "${speech_key}" as NonPlayer is not defined in speech.ts`
      );
    }

    const milestone_ref = levelPropertyLookup(properties)("milestone");

    if (milestone_ref !== undefined) {
      this._createMilestoneFromRef(milestone_ref);
    }

    this.resolveState(`nonPlayers.${this.id}`);

    bus.register(this);
  }

  /** If the NPC is expired and should be torn down */
  get isExpired() {
    return this._is_expired;
  }

  /** Manually tear down the npc */
  public expire() {
    bus.unregister(this);
    this._is_expired = true;
  }

  /**
   * Update the non-player
   *
   * @param dt - delta time
   */
  public update(dt: number) {}

  /**
   * Draw NPC and all underlying entities
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
    super.draw(ctx, offset, resolution);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      "dialogue.end": (e: CustomEvent) => {
        /**
         * TODO: Assuming this sort of data will be sent is fragile. We need a
         * better way to enforce it. Maybe with a generic type.
         */
        const { speaker } = e.detail;

        /**
         * If the this actor was responsible for the dialogue and there is a
         * milestone associated with it we are assuming that milestone is now
         * attained.This may need to be refactored when milestone attainment
         * becomes more complex
         */
        const caused_by_npc =
          this._speech.dialogue.length > 0 && speaker === this;

        if (!caused_by_npc) {
          return;
        }

        this._milestone?.attain_on === MilestoneAttainOn.DialogueComplete &&
          this._milestone.attain({ actor: this });

        this.expire();
      },

      keyup: (e: KeyboardEvent) => {
        if (e.key === "Enter" && this.collisions.length) {
          this.speak();
        }
      },

      "player.move": (e: CustomEvent) => {
        const player = e.detail?.player;

        if (!player) {
          throw new MissingDataError(
            "Player missing on player.move event as tracked by non-player."
          );
        }

        if (this.collidesWith(player)) {
          if (!this.collisions.includes(player)) {
            this.collisions.push(player);
          }
        } else if (this.collisions.includes(player)) {
          this.collisions = this.collisions.filter((actor) => actor !== player);
        }
      },
    };
  }

  /** Start a dialogue with all actors the non-player has collided with */
  private speak() {
    if (this.locked) {
      return;
    }

    bus.emit("dialogue.create", {
      speech: [...this._speech.dialogue],
      speaker: this,
    });
  }

  /**
   * Create milestone for the NPC
   *
   * @param ref - ref name of milestone
   */
  private _createMilestoneFromRef(ref: string) {
    this._milestone = new Milestone(ref);

    // Assuming if there is a milestone related to the NPC they're not needed
    if (this._milestone.attained) {
      this.expire();
    }
  }
}

export default NonPlayer;
