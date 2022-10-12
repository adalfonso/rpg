import "./_resource/css/app.css";
import Display from "@/ui/Display";
import Game from "@/game/Game";
import Player from "./actor/Player";
import { Vector } from "excalibur";
import config from "@/config";
import { APP_NAME, SAVE_FILE, RESOLUTION, SAVE_DIR } from "./constants";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { HeroTeam } from "./combat/HeroTeam";
import { Pet } from "./actor/Pet";
import { path } from "@tauri-apps/api";
import { resolveSaveData, startAnimation } from "@/util";
import { state } from "@/state/StateManager";

document.addEventListener("DOMContentLoaded", async (_event) => {
  const save_dir = await resolveSaveData(APP_NAME)(SAVE_DIR);
  const save_path = await path.join(save_dir, SAVE_FILE);
  await state().load(save_path);

  const canvas = <HTMLCanvasElement>document.getElementById("game");
  const player_template = {
    x: 75,
    y: 75,
    width: 18,
    height: 32,
    name: "Me",
    type: "player",
  };
  const player_position = new Vector(player_template.x, player_template.y);
  const player_size = new Vector(player_template.width, player_template.height);
  const player = new Player(
    player_position.scale(config.scale),
    player_size.scale(config.scale),
    player_template
  );
  const doggo = new Pet(player.position.clone(), player.size.clone(), {
    name: "Lea",
    type: "lea",
    x: 0,
    y: 0,
    width: 16,
    height: 32,
  });
  player.adoptPet(doggo);

  const team = new HeroTeam([player]);
  const dialogue = new DialogueMediator(team);
  const game = new Game(team, dialogue);
  const display = new Display(RESOLUTION, canvas, game);

  startAnimation((dt: number) => {
    game.update(dt);
    display.draw();
  });
});
