import { expect } from "chai";
import { InventoryState, isInventoryState } from "@/state/InventoryState";

describe("isInventoryState", () => {
  [
    {
      label: "valid, empty",
      template: {
        menu: {
          item: [],
          armor: [],
          weapon: [],
          special: [],
        },
      },
      expected: true,
    },
    { label: "valid, full", template: getData(), expected: true },
    {
      label: "invalid type",
      template: "string",
      expected: false,
    },
    {
      label: "missing menu",
      template: {},
      expected: false,
    },
    {
      label: "missing sub menu",
      template: { menu: { item: [], armor: [], weapon: [] } },
      expected: false,
    },
    {
      label: "invalid sub menu",
      template: {
        menu: {
          item: [2],
          armor: [],
          weapon: [],
          special: [],
        },
      },
      expected: false,
    },
  ].forEach(({ label, template, expected }) => {
    it(`detects ${label}`, () => {
      expect(isInventoryState(template)).to.eq(expected);
    });
  });
});

function getData(): InventoryState {
  return {
    menu: {
      item: ["a"],
      armor: ["s"],
      weapon: ["e"],
      special: ["w"],
    },
  };
}
