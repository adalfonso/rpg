import * as ex from "excalibur";
import Damage from "../Damage";
import MissingDataError from "@/error/MissingDataError";
import Renderable from "@/ui/Renderable";
import { Actor } from "@/actor/Actor";
import { Constructor } from "@/mixins";
import { EntityConfig } from "./types";
import { Nullable } from "@/types";
import { bus } from "@/event/EventBus";
import { OffsetDrawable } from "@/interfaces";

export interface Descriptive {
  displayAs: string;
  description: string;
}
/**
 * Generate a Descriptive mixin
 *
 * @param Base - base class
 */
export const Descriptive = <T extends Constructor>(Base: T) =>
  /** Descriptive classes store UI description information about itself */
  class Descriptive extends Base implements Descriptive {
    /** Stores the descriptors */
    protected _template: Nullable<EntityConfig> = null;

    /** Get the display name */
    get displayAs() {
      if (!this._template) {
        throw new MissingDataError(
          `Failed to locate template for Descriptive.displayAs`
        );
      }

      return this._template.displayAs;
    }

    /** Get the description */
    get description() {
      if (!this._template) {
        throw new MissingDataError(
          `Failed to locate template for Descriptive.description`
        );
      }

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
  class Visual extends Base implements OffsetDrawable {
    /** Reference to UI component */
    protected _ui: Nullable<Renderable> = null;

    /** Get the UI component */
    get ui() {
      return this._ui;
    }

    /**
     * Draw the entity
     *
     * @param ctx render context
     * @param offset render position offset
     * @param resolution render resolution
     */
    public draw(
      ctx: CanvasRenderingContext2D,
      offset: ex.Vector,
      resolution: ex.Vector
    ) {
      if (!this._ui) {
        throw new MissingDataError("Missing UI when trying to draw Visual");
      }

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
    protected _damage: Nullable<Damage> = null;

    /** Get the damage reference */
    get damage() {
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
     * @param actor the actor who to equip the item to
     *
     * @emits equipment.equip
     */
    public equip(actor: Actor) {
      if (this._isEquipped) {
        return;
      }

      this._isEquipped = true;

      bus.emit("equipment.equip", { equipment: this, actor });
    }

    /** Unequip the equipment */
    public unequip() {
      this._isEquipped = false;

      bus.emit("equipment.unequip", { equipment: this });
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
