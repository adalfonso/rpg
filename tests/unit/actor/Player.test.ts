import { Direction } from "@/ui/types";
import { Pet } from "@/actor/Pet";
import { Vector } from "excalibur";
import { getPet, getPlayer } from "./_fixtures";
describe("Player", () => {
  describe("update", () => {
    it("tells the pet to follow", () => {
      const player = getPlayer();
      const pet = getPet();
      const spy = jest.spyOn(pet, "follow");
      const update_spy = jest.spyOn(pet, "update");
      const dt = 16;

      player.adoptPet(pet);
      player.onPostUpdate({} as ex.Engine, dt);

      expect(update_spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({
        position: Vector.Zero,
        direction: Direction.None,
        dt,
      });
    });
  });

  describe("adoptPet", () => {
    it("only owns one pet at a time", () => {
      const player = getPlayer();

      player.adoptPet({} as Pet);

      expect(() => player.adoptPet({} as Pet)).toThrowError(
        "Player _default_actor can only have one pet at a time"
      );
    });
  });
});
