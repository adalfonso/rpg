import big_sword from "./weapon/big_sword.png";
import doggo from "./doggo.png";
import empanada from "./item/empanada.png";
import knight from "./enemy/knight.png";
import missing from "./missing_image.png";
import pisti from "./pisti.png";
import player from "./player_new.png";
import ruby_sword from "./weapon/ruby_sword.png";
import water_bottle from "./item/water_bottle.png";

const manifest: Record<string, unknown> = {
  missing,
  actor: {
    player,
    pisti,
    knight,
    doggo,
  },
  item: {
    empanada,
    water_bottle,
  },
  weapon: {
    big_sword,
    ruby_sword,
  },
};

export default manifest;
