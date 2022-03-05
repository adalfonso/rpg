import Player from "@/actor/Player";
import Team from "@/combat/Team";
import Vector from "@common/Vector";
import actors from "@/actor/actors";
import sinon from "sinon";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { expect } from "chai";
import { getActorTemplate } from "tests/unit/level/fixtures";
import Dialogue from "@/ui/dialogue/Dialogue";

beforeEach(() => {
  actors._foo_dialogue_mediator = getActorTemplate();
});

describe("DialogueMediator", () => {
  describe("_createDialogue", () => {
    it("detects missing speech", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() => events["dialogue.create"]({ detail: {} })).to.throw(
        "Unable to find speech or speaker when creating dialogue from DialogueMediator"
      );
    });

    it("detects invalid speech", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() =>
        events["dialogue.create"]({ detail: { speech: "foo" } })
      ).to.throw(
        'Invalid data type for "speech" @ DialogueMediator/dialogue.create'
      );
    });

    it("detects invlaid speaker", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() =>
        events["dialogue.create"]({ detail: { speech: ["foo"], speaker: {} } })
      ).to.throw(
        'Invalid data type for "speaker" @ DialogueMediator/dialogue.create'
      );
    });

    it("locks targets while dialogue is active", () => {
      const player = new Player(new Vector(0, 0), new Vector(0, 0), {
        type: "_foo_dialogue_mediator",
      } as any);

      const spy = sinon.spy(player);
      sinon.stub(Dialogue.prototype, "isDone").value(true);

      const team = new Team([player]);
      const mediator = new DialogueMediator(team);
      const events = mediator.register();

      events["dialogue.create"]({ detail: { speech: ["foo"] } });

      sinon.assert.calledOnce(spy.lock);
      sinon.assert.notCalled(spy.unlock);

      mediator.update(1000);
      mediator.update(1);
      sinon.assert.calledOnce(spy.unlock);
    });
  });
});
