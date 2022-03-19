import Ajv, { JSONSchemaType } from "ajv";

/**
 * Generate state validator for data stored in state
 *
 * @param schema - ajv data schema
 * @param data - state data
 *
 * @return is state data is expected type
 */
export const isStateFactory =
  <T>(schema: JSONSchemaType<T>) =>
  (data: unknown): data is T =>
    new Ajv().compile(schema)(data);
