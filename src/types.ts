/** Determine if input is string[] */
export const isStringArray = (input: unknown): input is string[] =>
  Array.isArray(input) &&
  input.filter((value) => typeof value !== "string").length === 0;

type Key = string | number | symbol;

export const isRecord = (value: unknown): value is Record<Key, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export type Nullable<T> = T | null;
