import { JSONSchemaType } from "ajv";
import { isStateFactory } from "@/state/types";

export interface MilestoneState {
  attained: boolean;
}

const schema: JSONSchemaType<MilestoneState> = {
  type: "object",
  properties: { attained: { type: "boolean" } },
  required: ["attained"],
  additionalProperties: false,
};

export const isMilestoneState = isStateFactory(schema);
