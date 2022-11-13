import { isActorState } from "@schema/actor/ActorSchema";

describe("ActorSchema", () => {
  describe("isActorState", () => {
    [
      {
        label: "passes a valid structure",
        data: {
          class: "actor",
          defeated: false,
          dmg: 0,
          lvl: 10,
        },
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: {
          class: "actor",
          defeated: "invalid value",
          dmg: 0,
          lvl: 10,
        },
        expected: false,
      },
      {
        label: "fails an incomplete structure",
        data: {
          type: "actor",
        },
        expected: false,
      },
      {
        label: "fails an empty structure",
        data: {},
        expected: false,
      },
    ].forEach(({ label, data, expected }) => {
      it(label, () => {
        expect(isActorState(data)).toBe(expected);
      });
    });
  });
});
