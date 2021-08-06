import { EntityConfig } from "@/combat/strategy/types";
import { UiData } from "@/ui/types";

/**
 * Info about an item
 * @prop category - more specific use case of the item
 * @prop ui       - render info
 * @prop value    - value of the item
 *
 */
export interface ItemConfig extends EntityConfig {
  category: string;
  ui: UiData;
  value: number;
}

/** A list of items */
export type ItemList = Record<string, ItemConfig>;
