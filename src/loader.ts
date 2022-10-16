import player_sprite from "@img/player_new.png";
import * as ex from "excalibur";

export const loadImages = () => ({
  player: new ex.ImageSource(player_sprite),
});
