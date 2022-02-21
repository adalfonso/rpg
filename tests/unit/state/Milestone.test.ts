import StateManager from "@/state/StateManager";
import sinon from "sinon";
import { Milestone } from "@/state/Milestone";
import { expect } from "chai";

afterEach(() => {
  sinon.restore();
});

describe("Milestone", () => {
  describe("obtained", () => {
    it("detects an obtained milestone", () => {
      sinon.stub(StateManager.prototype, "get").returns({ obtained: true });

      const milestone = new Milestone("obtained_milestone");

      expect(milestone.obtained).to.be.true;
    });

    it("detects an unobtained milestone", () => {
      sinon.stub(StateManager.prototype, "get").returns({ obtained: false });

      const milestone = new Milestone("unobtained_milestone");

      expect(milestone.obtained).to.be.false;
    });

    it("detects an unobtained milestone (no state)", () => {
      sinon.stub(StateManager.prototype, "get").returns(undefined);

      const milestone = new Milestone("unobtained_milestone");

      expect(milestone.obtained).to.be.false;
    });
  });
});
