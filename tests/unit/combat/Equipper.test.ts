import Actor from "@/actor/Actor";
import { Equipper } from "@/combat/Equipper";
import Weapon from "@/combat/strategy/Weapon";

describe("Equipper", () => {
  describe("getters", () => {
    it("gets the actor", () => {
      const actor = {} as unknown as Actor;
      const weapon = {} as unknown as Weapon;
      const equipper = new Equipper(actor, weapon);

      expect(equipper.actor).toBe(actor);
    });

    it("gets the ref", () => {
      const actor = { state_ref: "actor_ref" } as unknown as Actor;
      const weapon = {} as unknown as Weapon;
      const equipper = new Equipper(actor, weapon);

      expect(equipper.ref).toEqual("actor_ref");
    });
  });

  describe("displayAs", () => {
    it("shows the actor's name", () => {
      const actor = { displayAs: "actor_name" } as unknown as Actor;
      const weapon = {} as unknown as Weapon;
      const equipper = new Equipper(actor, weapon);

      expect(equipper.displayAs).toEqual("actor_name");
    });

    it("shows an equipped suffix for this weapon", () => {
      const weapon = {} as unknown as Weapon;
      const actor = {
        displayAs: "actor_name",
        weapon,
      } as unknown as Actor;

      const equipper = new Equipper(actor, weapon);

      expect(equipper.displayAs).toEqual("actor_name   (equipped)");
    });
  });

  describe("equip", () => {
    it("equips the weapon", () => {
      const actor = {} as unknown as Actor;
      const weapon = {
        equip: function () {
          actor.weapon = this as any;
        },
      } as unknown as Weapon;
      const equipper = new Equipper(actor, weapon);

      expect(actor.weapon).toEqual(undefined);

      equipper.equip();

      expect(actor.weapon).toEqual(weapon);
    });

    it("doesn't equip when a weapon is already set", () => {
      const actor = {
        weapon: true,
      } as unknown as Actor;

      const weapon = {
        equip: function () {
          actor.weapon = this as any;
        },
      } as unknown as Weapon;
      const equipper = new Equipper(actor, weapon);

      expect(actor.weapon).toEqual(true);

      equipper.equip();

      expect(actor.weapon).toEqual(true);
    });
  });
});
