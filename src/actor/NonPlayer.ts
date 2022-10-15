import Actor from "./Actor";
import MissingDataError from "@/error/MissingDataError";
import { Vector } from "excalibur";
import { Drawable } from "@/interfaces";
import { Milestone } from "@/state/milestone/Milestone";
import { MilestoneAttainOn } from "@/state/milestone/types";
import { Nullable } from "@/types";
import { Speech } from "./types";
import { bus, EventType } from "@/event/EventBus";
import { getSpeech } from "./speech";
import {
  LevelFixtureTemplate,
  levelPropertyLookup,
} from "@/level/LevelFixture";

/** A non-playable character */
class NonPlayer extends Actor implements Drawable {
  /** Entities that were recently collided with */
  private collisions: Actor[] = [];

  /** Speech/dialogue spoken by the npc */
  private _speech: Speech;

  /** Milestones tied to the npc */
  private _milestone: Nullable<Milestone> = null;

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
    const { class: className, name, properties } = template;
    const speech_key = `${className}.${name}`;

    const speech = getSpeech(speech_key);

    if (!speech) {
      throw new MissingDataError(
        `Speech data for "${speech_key}" as NonPlayer is not defined in speech.ts`
      );
    }

    this._speech = speech;

    const milestone_ref = levelPropertyLookup(properties ?? [])("milestone");

    if (milestone_ref !== undefined) {
      this._milestone = new Milestone(milestone_ref);

      // Assuming if there is a milestone related to the NPC they're not needed
      if (this._milestone.attained) {
        this.kill();
      }
    }

    this._resolveState();

    bus.register(this);
  }

  /** State lookup key */
  get state_ref() {
    return `nonPlayers.${this.id}`;
  }

  /** If the NPC is expired and should be torn down */
  get isExpired() {
    return this._is_expired;
  }

  /** Kill off a non-player */
  public kill() {
    bus.unregister(this);
    this._is_expired = true;
  }

  /**
   * Update the non-player
   *
   * @param dt - delta time
   */
  public update(_dt: number) {
    //
  }

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
  public register() {
    return {
      [EventType.Custom]: {
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

          this.kill();
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
            this.collisions = this.collisions.filter(
              (actor) => actor !== player
            );
          }
        },
      },
      [EventType.Keyboard]: {
        keyup: (e: KeyboardEvent) => {
          if (e.key === "Enter" && this.collisions.length) {
            this.speak();
          }
        },
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
}

export default NonPlayer;
