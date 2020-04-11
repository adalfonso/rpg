/**
 * Lowercase the first character of a string
 *
 * @param  {string} input String to format
 *
 * @return {string}       Formatted string
 */
export const lcFirst = (input: string): string =>
  input.charAt(0).toLowerCase() + input.slice(1);
