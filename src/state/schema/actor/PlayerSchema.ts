import { JSONSchemaType } from "ajv";
import { isStateFactory } from "@/state/types";
import { ActorState } from "./ActorSchema";
import { Nullable } from "@/types";

export interface PlayerState extends ActorState {
  name: string;
  exp: number;
  equipped: Nullable<string>;
  height: number;
  width: number;
}

export const schema: JSONSchemaType<PlayerState> = {
  type: "object",
  properties: {
    name: { type: "string" },
    class: { type: "string" },
    defeated: { type: "boolean" },
    dmg: { type: "number" },
    lvl: { type: "number" },
    exp: { type: "number" },
    equipped: { type: "string", nullable: true },
    height: { type: "number" },
    width: { type: "number" },
  },
  required: [
    "name",
    "class",
    "defeated",
    "dmg",
    "lvl",
    "exp",
    "equipped",
    "height",
    "width",
  ],
  additionalProperties: false,
};

export const isPlayerState = isStateFactory(schema);
