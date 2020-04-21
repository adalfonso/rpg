import { expect } from "chai";
import Sut from "../../src/renderer/ts/actors/Player";
import Vector from "../../src/common/Vector";

/**
 * TODO: Cannot currently run these test because tsconfig-paths is unable to
 * resolve the .png files. Either find a solution at the module-resolution level
 * or move loading of the .pngs behind a class that can be mocked.
 */

// describe("Player", () => {
//   it("moveTo", () => {
//     let sut = getSut();

//     expect(sut.position).to.deep.equal({ x: 0, y: 0 });
//     sut.moveTo(new Vector(1, 2));
//     expect(sut.position).to.deep.equal({ x: 1, y: 2 });
//   });
// });

// const getSut = () => {
//   return new Sut(new Vector(0, 0), new Vector(10, 10));
// };
