import { isInventoryState } from "@schema/menu/InventorySchema";

describe("InventorySchema", () => {
  describe("isInventoryState", () => {
    [
      {
        label: "passes a valid structure",
        data: {
          menu: {
            item: ["foo"],
            weapon: ["bar"],
            armor: ["baz"],
            special: ["bot"],
          },
        },
        expected: true,
      },
      {
        label: "passes a valid, empty structure",
        data: {
          menu: { item: [], weapon: [], armor: [], special: [] },
        },
        expected: true,
      },
      {
        label: "fails an invalid structure",
        data: {
          menu: { item: [1], weapon: [], armor: [], special: [] },
        },
        expected: false,
      },
      {
        label: "fails an incomplete structure",
        data: {
          menu: { weapon: [], armor: [], special: [] },
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
        expect(isInventoryState(data)).toBe(expected);
      });
    });
  });
});
