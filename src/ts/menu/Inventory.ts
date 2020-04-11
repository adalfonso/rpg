import BaseMenu from "./BaseMenu";
import Vector from "@src/ts/Vector";
import Weapon from "@/item/Weapon";
import { Drawable, Eventful } from "@/interfaces";

export default class Inventory extends BaseMenu implements Eventful, Drawable {
  protected equipped: object;

  constructor() {
    let menu = [
      {
        type: "item",
        description: "Items",
        menu: [],
      },
      {
        type: "equipable",
        description: "Equipment",
        menu: [],
      },
      {
        type: "special",
        description: "Special",
        menu: [],
      },
    ];

    super(menu);
    this.active = false;

    this.equipped = {
      weapon: null,
      armor: null,
      spell: null,
    };

    // TODO: move this elsewhere. This is temporary.
    this.store(
      new Weapon({
        name: "Basic Sword",
        description: "A basic bish sword.",
        damage: 3,
      })
    );

    this.store(
      new Weapon({
        name: "Mace",
        description: "An effing mace. Watch out!",
        damage: 10,
      })
    );

    this.store(
      new Weapon({
        name: "Pole Arm",
        description: "Swift and strong.",
        damage: 5,
      })
    );
  }

  store(item) {
    this.menu
      .filter((option) => {
        return option.type === item.type;
      })[0]
      .menu.push(item);
  }

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {
    if (!this.active) {
      return;
    }

    ctx.save();
    ctx.translate(-offset.x, -offset.y);
    ctx.fillStyle = "rgba(200, 200, 200, .96)";
    ctx.fillRect(0, 0, resolution.x, resolution.y);
    ctx.fillStyle = "#75A";
    ctx.textAlign = "left";

    let current = this.currentOption;

    // Menu Tier
    this.selected.reduce((subMenuOffset, selected, index) => {
      let menu = index > 0 ? this.selected[index - 1].menu : this.menu;

      return (
        subMenuOffset +
        // Menu menu
        menu.reduce((subCarry, option, subIndex) => {
          let pos = new Vector(
            48 + 200 * index,
            48 + 48 * (subIndex + subMenuOffset + 1)
          );

          ctx.save();
          ctx.font = "24px Arial";

          if (option === current) {
            ctx.shadowColor = "#75A";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;
            ctx.font = "bold 24px Arial";
          }

          ctx.fillText(option.description, pos.x, pos.y);
          ctx.restore();

          return subCarry + (option === selected ? subIndex : 0);
        }, 0)
      );
    }, 0);

    ctx.restore();
  }

  register(): object {
    return [
      super.register(),
      {
        keyup: (e) => {
          if (e.key === "i" && !this.locked) {
            this.active ? this.close() : this.open();
          }
        },
      },
    ];
  }
}
