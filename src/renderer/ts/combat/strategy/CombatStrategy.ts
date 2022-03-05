import Damage from "../Damage";
import Renderable from "@/ui/Renderable";
import Vector from "@common/Vector";
import { Constructor } from "@/mixins";
import { EntityConfig } from "./types";
import { bus } from "@/EventBus";

/**
 * Generate a Descriptive mixin
 *
 * @param Base - base class
 */
export const Descriptive = <T extends Constructor>(Base: T) =>
  /** Descriptive classes store UI description information about itself */
  class Descriptive extends Base {
    /** Stores the descriptors */
    protected _template: EntityConfig;

    /** Get the display name */
    get displayAs(): string {
      return this._template.displayAs;
    }

    /** Get the description */
    get description(): string {
      return this._template.description;
    }
  };

/**
 * Generate a Visual mixin
 *
 * @param Base - base class
 */
export const Visual = <T extends Constructor>(Base: T) =>
  /** Classes that have a UI component */
  class Visual extends Base {
    /** Reference to UI component */
    protected _ui: Renderable;

    /** Get the UI component */
    get ui() {
      return this._ui;
    }

    /**
     * Draw the entity
     *
     * @param ctx        - render context
     * @param offset     - render position offset
     * @param resolution - render resolution
     */
    public draw(
      ctx: CanvasRenderingContext2D,
      offset: Vector,
      resolution: Vector
    ) {
      this._ui.draw(ctx, offset, resolution);
    }
  };

/**
 * Generate a DamageDealing mixin
 *
 * @param Base - base class
 */
export const DamageDealing = <T extends Constructor>(Base: T) =>
  /** A class that can deal some variety of damage */
  class DamageDealing extends Base {
    /** Reference to damage */
    protected _damage: Damage;

    /** Get the damage reference */
    get damage(): Damage {
      return this._damage;
    }
  };

/**
 * Generate a Equipable mixin
 *
 * @param Base - base class
 */
export const Equipable = <T extends Constructor>(Base: T) =>
  /** A class that maintains equipment */
  class Equipable extends Base {
    /** If the equipment is currently equipped */
    protected _isEquipped = false;

    /** Get if the equipment is equippped */
    get isEquipped(): boolean {
      return this._isEquipped;
    }

    /**
     * Equip the equipment
     *
     * @emits equipment.equip
     */
    public equip() {
      this._isEquipped = true;

      bus.emit("equipment.equip", { equipment: this });
    }

    /** Unequip the equipment */
    public unequip() {
      this._isEquipped = false;
    }
  };

interface CombatStrategy {
  ref: string;
  displayAs: string;
  damage: Damage;
}

/** Basis for a combat strategy */
class CombatStrategy {
  /**
   * Emit an event when the strategy is invoked
   *
   * @emits battle.action
   */
  public async use() {
    bus.emit("battle.action", { strategy: this });
  }
}

export default CombatStrategy;
