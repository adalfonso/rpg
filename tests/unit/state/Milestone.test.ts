import { StateManager } from "@/state/StateManager";
import { Milestone } from "@/state/milestone/Milestone";

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
