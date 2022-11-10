import { TiledTemplate } from "@/actor/types";

export const getTiledTemplate = (input: any = {}) => {
  const { class: className, name } = input;

  return {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    visible: true,
    rotation: 0,
    name: name ?? "foo",
    class: className ?? "foo",
    value: "",
    properties: [] as any[],
  } as unknown as TiledTemplate;
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
