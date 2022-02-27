/** Determine if input is string[] */
export const isStringArray = (input: unknown): input is string[] =>
  Array.isArray(input) &&
  input.filter((value) => typeof value !== "string").length === 0;
