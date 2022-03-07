import { PlayerState } from "@/state/schema/actor/PlayerSchema";

/** Types of damage that can be dealt */
export type DamageType = "physical" | "special";

export type TeamState = PlayerState[];
