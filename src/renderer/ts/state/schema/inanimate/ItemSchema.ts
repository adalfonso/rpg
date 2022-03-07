import { JSONSchemaType } from "ajv";
import { isStateFactory } from "@/state/types";

export interface ItemState {
  obtained: boolean;
}

const schema: JSONSchemaType<ItemState> = {
  type: "object",
  properties: { obtained: { type: "boolean" } },
  required: ["obtained"],
  additionalProperties: false,
};

export const isItemState = isStateFactory(schema);
