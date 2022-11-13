import * as ex from "excalibur";

export const getEngine = () => {
  return {
    input: {
      keyboard: {
        on: jest.fn(),
      },
    },
  } as unknown as ex.Engine;
};
