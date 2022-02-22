import StateManager from "@/state/StateManager";
import sinon from "sinon";
import { Milestone } from "@/state/milestone/Milestone";
import { MilestoneConfig } from "@/state/milestone/types";
import { expect } from "chai";
import { milestone_list } from "@/state/milestone/milestones";

beforeEach(() => {
  milestone_list._attained_milestone = {} as MilestoneConfig;
  milestone_list._unattained_milestone = {} as MilestoneConfig;
});

afterEach(() => {
  sinon.restore();
});

describe("Milestone", () => {
  describe("attained", () => {
    it("detects an attained milestone", () => {
      sinon.stub(StateManager.prototype, "get").returns({ attained: true });

      const milestone = new Milestone("_attained_milestone");

      expect(milestone.attained).to.be.true;
    });

    it("detects an unattained milestone", () => {
      sinon.stub(StateManager.prototype, "get").returns({ attained: false });

      const milestone = new Milestone("_unattained_milestone");

      expect(milestone.attained).to.be.false;
    });

    it("detects an unattained milestone (no state)", () => {
      sinon
        .stub(StateManager.prototype, "get")
        .onCall(0)
        .returns(undefined)
        .onCall(1)
        .returns({ attained: false });

      const milestone = new Milestone("_unattained_milestone");

      expect(milestone.attained).to.be.false;
    });
  });
});
