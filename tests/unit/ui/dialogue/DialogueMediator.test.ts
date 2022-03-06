import Dialogue from "@/ui/dialogue/Dialogue";
import Player from "@/actor/Player";
import Team from "@/combat/Team";
import Vector from "@common/Vector";
import abilities from "@/combat/strategy/abilities";
import actors from "@/actor/actors";
import sinon from "sinon";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { EventType } from "@/EventBus";
import { expect } from "chai";
import {
  getAbilityTemplate,
  getActorTemplate,
} from "tests/unit/level/fixtures";

before(() => {
  actors._foo_dialogue_mediator = getActorTemplate();
  abilities.damage._default_ability = getAbilityTemplate();
});

describe("DialogueMediator", () => {
  describe("_createDialogue", () => {
    it("detects missing speech", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() =>
        events[EventType.Custom]["dialogue.create"]({
          detail: {},
        } as CustomEvent)
      ).to.throw(
        "Unable to find speech or speaker when creating dialogue from DialogueMediator"
      );
    });

    it("detects invalid speech", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() =>
        events[EventType.Custom]["dialogue.create"]({
          detail: { speech: "foo" },
        } as CustomEvent)
      ).to.throw(
        'Invalid data type for "speech" @ DialogueMediator/dialogue.create'
      );
    });

    it("detects invalid speaker", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() =>
        events[EventType.Custom]["dialogue.create"]({
          detail: { speech: ["foo"], speaker: {} },
        } as CustomEvent)
      ).to.throw(
        'Invalid data type for "speaker" @ DialogueMediator/dialogue.create'
      );
    });

    it("locks targets while dialogue is active", () => {
      const player = new Player(Vector.empty(), Vector.empty(), {
        type: "_foo_dialogue_mediator",
      } as any);

      const spy = sinon.spy(player);
      sinon.stub(Dialogue.prototype, "isDone").value(true);

      const team = new Team([player]);
      const mediator = new DialogueMediator(team);
      const events = mediator.register();

      events[EventType.Custom]["dialogue.create"]({
        detail: { speech: ["foo"] },
      } as CustomEvent);

      sinon.assert.calledOnce(spy.lock);
      sinon.assert.notCalled(spy.unlock);

      mediator.update(1000);
      mediator.update(1);
      sinon.assert.calledOnce(spy.unlock);
    });
  });
});
