export const getFixtureTemplate = (input: any = {}) => {
  const { type, name } = input;
  return {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    name: name ?? "foo",
    type: type ?? "foo",
    value: "",
    properties: [] as any[],
  };
};

export const getAbilityTemplate = () => ({
  displayAs: "default",
  description: "default",
  value: 20,
  isSpecial: false,
  ui: {
    sprite: "missing",
  },
});
