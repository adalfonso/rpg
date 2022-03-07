import { isActorState } from "@/state/schema/actor/ActorSchema";
import { expect } from "chai";

describe("ActorSchema", () => {
  describe("isActorState", () => {
    [
      {
        label: "passes a valid structure",
        data: {
          type: "actor",
          defeated: false,
          dmg: 0,
          lvl: 10,
        },
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: {
          type: "actor",
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
        expect(isActorState(data)).to.equal(expected);
      });
    });
  });
});