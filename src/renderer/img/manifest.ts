import bigSword from "./weapon/big_sword.png";
import dungeon from "./dungeon.png";
import dungeonBlue from "./dungeon_sheet.png";
import empanada from "./item/empanada.png";
import knight from "./enemy/knight.png";
import missingImage from "./missing_image.png";
import player from "./player_new.png";
import waterBottle from "./item/water_bottle.png";

export default {
  missing: missingImage,
  actor: {
    player: player,
    knight: knight,
  },
  item: {
    empanada: empanada,
    water_bottle: waterBottle,
  },
  tileset: {
    dungeon: dungeon,
    dungeon_blue: dungeonBlue,
  },
  weapon: {
    big_sword: bigSword,
  },
};
