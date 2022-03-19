export interface RenderOptions {
  font?: string;
  fillStyle?: string;
  shadowColor?: string;
  shadowOffsetY: number;
}

/** Configs for different text styles */
export const config: Record<string, RenderOptions> = {
  event: {
    font: `bold 32px Minecraftia`,
    fillStyle: "#0AA",
    shadowColor: "#066",
    shadowOffsetY: 4,
  },
};
