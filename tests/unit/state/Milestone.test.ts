import StateManager from "@/state/StateManager";
import { Milestone } from "@/state/milestone/Milestone";
import { MilestoneConfig } from "@/state/milestone/types";

jest.mock("@/state/milestone/milestones", () => ({
  milestones: () => ({
    _attained_milestone: () => ({ foo: {} as MilestoneConfig }),
    _unattained_milestone: () => ({ foo: {} as MilestoneConfig }),
  }),
}));

describe("Milestone", () => {
  describe("attained", () => {
    it("detects an attained milestone", () => {
      jest
        .spyOn(StateManager.prototype, "get")
        .mockReturnValueOnce({ attained: true });

      const milestone = new Milestone("_attained_milestone");

      expect(milestone.attained).toBe(true);
    });

    it("detects an unattained milestone", () => {
      jest
        .spyOn(StateManager.prototype, "get")
        .mockReturnValueOnce({ attained: false });

      const milestone = new Milestone("_unattained_milestone");

      expect(milestone.attained).toBe(false);
    });

    it("detects an unattained milestone (no state)", () => {
      jest.spyOn(StateManager.prototype, "get").mockReturnValueOnce(undefined);

      jest
        .spyOn(StateManager.prototype, "get")
        .mockReturnValueOnce({ attained: false });

      const milestone = new Milestone("_unattained_milestone");

      expect(milestone.attained).toBe(false);
    });
  });
});
