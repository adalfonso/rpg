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

export const getActorTemplate = () => ({
  displayAs: "Mr Foo",
  base_stats: { hp: 120, atk: 125, def: 85, sp_atk: 95, sp_def: 65, spd: 105 },
  ui: {
    sprite: "missing",
    frames: { x: 1, y: 4, idle: 1, north: 1, east: 1, south: 1, west: 1 },
    scale: 1,
    fps: 8,
  },
  abilities: [{ ref: "bar", level: 6 }],
});
