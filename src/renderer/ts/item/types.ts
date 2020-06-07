import { UiData } from "@/ui/types";

/**
 * Info about an item
 *
 * @prop description - description of the item
 * @prop displayAs   - display name
 * @prop category    - more specific use case of the item
 * @prop ui          - render info
 * @prop value       - value of the item
 *
 */
export type ItemTemplate = {
  description: string;
  displayAs: string;
  category: string;
  ui: UiData;
  value: number;
};

/**
 * A list of items
 */
export type ItemList = {
  [key: string]: ItemTemplate;
};
