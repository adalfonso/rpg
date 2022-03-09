jest.mock("@/util", () => {
  const original = jest.requireActual("@/util");

  return {
    ...original,
    getImagePath: () => "",
  };
});
