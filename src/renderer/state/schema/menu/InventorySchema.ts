import { JSONSchemaType } from "ajv";
import { isStateFactory } from "@/state/types";

export interface InventoryState {
  menu: {
    item: string[];
    weapon: string[];
    armor: string[];
    special: string[];
  };
}

export const schema: JSONSchemaType<InventoryState> = {
  type: "object",
  properties: {
    menu: {
      type: "object",
      properties: {
        item: { type: "array", items: { type: "string" } },
        weapon: { type: "array", items: { type: "string" } },
        armor: { type: "array", items: { type: "string" } },
        special: { type: "array", items: { type: "string" } },
      },
      required: ["item", "weapon", "armor", "special"],
      additionalProperties: false,
    },
  },
  required: ["menu"],
  additionalProperties: false,
};

export const isInventoryState = isStateFactory(schema);
