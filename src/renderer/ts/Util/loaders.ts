import manifest from "@img/manifest";

/**
 * Retrieve image path from a dot-separated string
 *
 * NOTE: Mainly stored outside of util because this loads images which can't be
 * resolved during testing.
 *
 * @param  {string} resource Dot-separated string
 *
 * @return {string}          Image path
 */
export const getImagePath = (resource: string): string => {
  return resource.split(".").reduce((carry: any, key: string) => {
    if (!carry[key]) {
      throw new Error(`Cannot find resource: ${key}`);
    }
    return carry[key];
  }, manifest);
};
