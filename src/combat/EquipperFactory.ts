import Weapon from "./strategy/Weapon";
import { TeamEquipper } from "./Equipper";
import { HeroTeam } from "./HeroTeam";

export type EquipperFactory = (weapon: Weapon) => TeamEquipper;

export const createEquipper = (team: HeroTeam) => (weapon: Weapon) =>
  new TeamEquipper(team, weapon);
