import { JSONSchemaType } from "ajv";
import { isStateFactory } from "@/state/types";
import { ActorState } from "./ActorSchema";
import { Nullable } from "@/types";

export interface PlayerState extends ActorState {
  exp: number;
  equipped: Nullable<string>;
}

export const schema: JSONSchemaType<PlayerState> = {
  type: "object",
  properties: {
    type: { type: "string" },
    defeated: { type: "boolean" },
    dmg: { type: "number" },
    lvl: { type: "number" },
    exp: { type: "number" },
    equipped: { type: "string", nullable: true },
  },
  required: ["type", "defeated", "dmg", "lvl", "exp", "equipped"],
  additionalProperties: false,
};

export const isPlayerState = isStateFactory(schema);
