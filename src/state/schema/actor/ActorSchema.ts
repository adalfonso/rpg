import { JSONSchemaType } from "ajv";
import { isStateFactory } from "@/state/types";

export interface ActorState {
  class: string;
  defeated: boolean;
  dmg: number;
  lvl: number;
}

const schema: JSONSchemaType<ActorState> = {
  type: "object",
  properties: {
    class: { type: "string" },
    defeated: { type: "boolean" },
    dmg: { type: "number" },
    lvl: { type: "number" },
  },
  required: ["class", "defeated", "dmg", "lvl"],
  additionalProperties: false,
};

export const isActorState = isStateFactory(schema);
