import MissingDataError from "@/error/MissingDataError";
import { Actor } from "./Actor";
import { Milestone } from "@/state/milestone/Milestone";
import { MilestoneAttainOn } from "@/state/milestone/types";
import { Nullable } from "@/types";
import { Player } from "./Player";
import { Speech, TiledTemplate } from "./types";
import { bus, EventType } from "@/event/EventBus";
import { getSpeech } from "./speech";

/** A non-playable character */
export class NonPlayer extends Actor {
  /** Entities that were recently collided with */
  private _has_player_collision = false;

  /** Speech/dialogue spoken by the npc */
  private _speech: Speech;

  /** Milestones tied to the npc */
  private _milestone: Nullable<Milestone> = null;

  /** If the npc is expired and should be torn down */
  private _is_expired = false;

  /**
   * Create a new NonPlayer instance
   *
   * @param template - info about the non-player
   */
  constructor(template: TiledTemplate) {
    super(template);
    const { class: className, name } = template;
    const speech_key = `${className}.${name}`;
    const speech = getSpeech(speech_key);

    if (!speech) {
      throw new MissingDataError(
        `Speech data for "${speech_key}" as NonPlayer is not defined in speech.ts`
      );
    }

    this._speech = speech;

    const milestone_ref = template.getProperty("milestone");

    if (milestone_ref !== undefined) {
      this._milestone = new Milestone(milestone_ref.value as string);

      // Assuming if there is a milestone related to the NPC they're not needed
      if (this._milestone.attained) {
        this.kill();
      }
    }

    this.on("collisionstart", (evt) => {
      if (!(evt.other instanceof Player)) {
        return;
      }

      this._has_player_collision = true;
    });

    this.on("collisionend", (evt) => {
      if (!(evt.other instanceof Player)) {
        return;
      }

      this._has_player_collision = false;
    });

    this._resolveState();

    bus.register(this);
  }

  /** State lookup key */
  get state_ref() {
    return `nonPlayers.${this.ref}`;
  }

  /** If the NPC is expired and should be torn down */
  get isExpired() {
    return this._is_expired;
  }

  /** Kill off a non-player */
  public kill() {
    bus.unregister(this);
    this._is_expired = true;
    super.kill();
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
      },
      [EventType.Keyboard]: {
        keyup: (e: KeyboardEvent) => {
          if (e.key === "Enter" && this._has_player_collision) {
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
