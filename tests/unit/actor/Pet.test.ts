// import { Direction } from "@/ui/types";
// import { Vector } from "excalibur";
// import { getPet } from "./_fixtures";

// const tests = [
//   {
//     label: "follows its owner",
//     steps: [
//       { position: new Vector(1, 0), direction: Direction.East, dt: 500 },
//       { position: new Vector(2, 0), direction: Direction.East, dt: 500 },
//       { position: new Vector(3, 0), direction: Direction.East, dt: 500 },
//     ],
//     expected: [
//       { position: new Vector(0, 0), direction: Direction.None },
//       { position: new Vector(1, 0), direction: Direction.East },
//       { position: new Vector(2, 0), direction: Direction.East },
//     ],
//   },
//   {
//     label: "only updates in accordance with trailing threshhold",
//     steps: [
//       { position: new Vector(1, 0), direction: Direction.East, dt: 100 },
//       { position: new Vector(2, 0), direction: Direction.East, dt: 100 },
//       { position: new Vector(3, 0), direction: Direction.East, dt: 100 },
//       { position: new Vector(3, 1), direction: Direction.North, dt: 100 },
//       { position: new Vector(3, 1), direction: Direction.North, dt: 100 },
//       { position: new Vector(3, 3), direction: Direction.North, dt: 500 },
//     ],
//     expected: [
//       { position: new Vector(0, 0), direction: Direction.None },
//       { position: new Vector(0, 0), direction: Direction.None },
//       { position: new Vector(0, 0), direction: Direction.None },
//       { position: new Vector(0, 0), direction: Direction.None },
//       { position: new Vector(0, 0), direction: Direction.None },
//       { position: new Vector(1, 0), direction: Direction.East },
//     ],
//   },
// ];

describe("Pet", () => {
  it("placeholder", () => {
    expect(1).toBe(1);
  });
});
