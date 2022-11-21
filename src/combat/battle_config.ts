interface BattleBlueprint {
  limit: number[];
  include: string[];
  require: string[];
}

interface BattleConfig {
  blueprints: Record<string, BattleBlueprint>;
}

export const config: BattleConfig = {
  blueprints: {
    knights: {
      limit: [1, 2, 3, 4],
      include: ["knight"],
      require: ["knight"],
    },
  },
};
