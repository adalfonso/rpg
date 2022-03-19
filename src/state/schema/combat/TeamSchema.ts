import { JSONSchemaType } from "ajv";
import { TeamState } from "@/combat/types";
import { isStateFactory } from "@/state/types";
import { schema as items } from "@schema/actor/PlayerSchema";

const schema: JSONSchemaType<TeamState> = { type: "array", items };

export const isTeamState = isStateFactory(schema);
