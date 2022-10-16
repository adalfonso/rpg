import Weapon from "@/combat/strategy/Weapon";
import { Actor } from "@/actor/Actor";
import { Equipper } from "@/combat/Equipper";

describe("Equipper", () => {
  describe("getters", () => {
    it("gets the actor", () => {
      const actor = createActor();
      const weapon = createWeapon(actor);
      const equipper = new Equipper(actor, weapon);

      expect(equipper.actor).toBe(actor);
    });

    it("gets the ref", () => {
      const actor = createActor();
      const weapon = createWeapon(actor);
      const equipper = new Equipper(actor, weapon);

      expect(equipper.ref).toEqual("actor_ref");
    });
  });

  describe("displayAs", () => {
    it("shows the actor's name", () => {
      const actor = createActor();
      const weapon = createWeapon(actor);
      const equipper = new Equipper(actor, weapon);

      expect(equipper.displayAs).toEqual("actor_name");
    });

    it("shows an equipped suffix for this weapon", () => {
      const actor = createActor();
      const weapon = createWeapon(actor);
      actor.weapon = weapon;

      const equipper = new Equipper(actor, weapon);

      expect(equipper.displayAs).toEqual("actor_name   (equipped)");
    });
  });

  describe("equip", () => {
    it("equips the weapon", () => {
      const actor = createActor();
      const weapon = createWeapon(actor);
      const equipper = new Equipper(actor, weapon);

      expect(actor.weapon).toEqual(null);

      equipper.equip();

      expect(actor.weapon).toEqual(weapon);
    });

    it("unequip when a weapon is already set", () => {
      const actor = createActor();
      const weapon = createWeapon(actor);
      actor.weapon = weapon;
      const equipper = new Equipper(actor, weapon);

      expect(actor.weapon).toEqual(weapon);

      equipper.equip();

      expect(actor.weapon).toEqual(null);
    });

    it("switched equipment between two actors", () => {
      const actor1 = createActor();
      const actor2 = createActor();

      const weapon = createWeapon(actor1);

      weapon.equip = function () {
        actor2.weapon = this;
      };

      const unequip_spy = jest.spyOn(weapon, "unequip");
      const equip_spy = jest.spyOn(weapon, "equip");

      actor1.weapon = weapon;
      const equipper = new Equipper(actor2, weapon);

      expect(actor1.weapon).toEqual(weapon);
      expect(actor2.weapon).toEqual(null);

      equipper.equip();

      expect(unequip_spy).toBeCalledTimes(1);
      expect(equip_spy).toBeCalledTimes(1);

      expect(actor1.weapon).toEqual(null);
      expect(actor2.weapon).toEqual(weapon);
    });
  });
});

const createActor = () => {
  return {
    id: Math.round(Math.random() * 1e16),
    displayAs: "actor_name",
    state_ref: "actor_ref",
    weapon: null,
  } as unknown as Actor;
};

const createWeapon = (actor) => {
  return {
    equip: function () {
      actor.weapon = this;
    },
    unequip: () => (actor.weapon = null),
  } as unknown as Weapon;
};
