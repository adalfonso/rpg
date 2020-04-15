import { bus } from "@/app";

export default class Weapon {
  public type: string;
  public damage: number;
  public name: string;
  public description: string;

  constructor(stats: object) {
    for (let stat in stats) {
      this[stat] = stats[stat];
    }

    this.type = "equipable";
  }

  use() {
    bus.emit("battleAction", this);
  }
}
