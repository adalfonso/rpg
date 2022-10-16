import { TiledMapResource } from "@excaliburjs/plugin-tiled";

/**
 * This classes in this file work based on convention. The convention applies to
 * how Tiled resource are named and organized
 *
 * Tiled Map
 * Naming Convention: [name]_map.json
 * Location: src/_resource/map
 *
 * Tiled Tileset
 * Naming Convention: [name]_tileset.json
 * Location - src/_resource/tileset
 *
 * Spritesheet
 * Naming Convention: [name]_spritesheet.png
 * Location - src/_resource/image/spritesheet
 */

// Where the resources are located within the project
const resource_path = "src/_resource";
type ResourceType = "map" | "tileset" | "spritesheet";

const isResourceType = (value: string): value is ResourceType => {
  return value === "map" || value === "tileset" || value === "spritesheet";
};

/**
 * Get the dir for a particular type of resource
 *
 * @param resource_type - the type of resource (map, tileset, or spritesheet)
 * @returns resource dir path
 */
const getResourceDir = (resource_type: ResourceType) => {
  if (resource_type === "map") {
    return `${resource_path}/map`;
  } else if (resource_type === "tileset") {
    return `${resource_path}/tileset`;
  }

  return `${resource_path}/img/spritesheet`;
};

/**
 * Abstraction over TileMapResource used to load Tiled maps
 *
 * This is mainly needed because TiledMapResource tries to load files based on
 * the paths inside the various Tiled files. This proves to be difficult without
 * modifying the build process to export the spritesheets in odd places. It's
 * easier to impose a convention and override the path resolution.
 */
export class TiledMap extends TiledMapResource {
  /**
   * Get the resource path for a resource type
   * @param _ origin path (unused)
   * @param relative_path relative path of the file
   * @returns resource path
   * @throws when it can't detect the resource name or type
   * @throws when the resource type is invalid
   */
  public convertPath = (_: string, relative_path: string) => {
    const resource = relative_path.split("/").pop()?.split("_");

    if (resource?.length !== 2) {
      throw new Error(
        `Failed to parse Tiled resource name and type from "${relative_path}"`
      );
    }

    const [name, type_with_ext] = resource;
    const resource_type = type_with_ext.replace(/\.\w+$/, "");

    if (!isResourceType(resource_type)) {
      throw new Error(
        `Failed to load invalid Tiled resource type "${resource_type}"`
      );
    }

    return `${getResourceDir(resource_type)}/${name}_${type_with_ext}`;
  };
}
