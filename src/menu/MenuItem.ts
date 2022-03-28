import TextBuffer from "@/ui/dialogue/TextBuffer";
import Vector from "@/physics/math/Vector";
import { MenuItemTemplate } from "./menus";
import { MenuRenderConfig } from "./ui/types";
import { SubMenu } from "./SubMenu";

/**
 * A single entry in a menu
 *
 * This class is essentially a universal adapter for various entities that serve
 * as items in a menu.
 */
export class MenuItem<T> {
  /** Internal menu reference */
  private _menu?: SubMenu<T>;

  /**
   * @param _template - original template reference
   */
  constructor(private _template: MenuItemTemplate<T>) {
    if (_template.menu !== undefined) {
      this._menu = new SubMenu(_template.menu);
    }
  }

  get menu() {
    return this._menu;
  }

  get ref() {
    return this._template.ref;
  }

  get displayAs() {
    return this._template.displayAs;
  }

  get source() {
    return this._template;
  }

  get menu_description() {
    if (!this.menu) {
      return this.displayAs;
    }

    return `${this.displayAs} (${this.menu.items.length})`;
  }

  /** Generic type getter helper */
  get<K extends keyof T>(key: K): T[K] {
    return this._template[key];
  }

  /**
   * Draw the menu item
   *
   * @param ctx canvas context
   * @param offset render position offset
   * @param resolution render resolution
   * @param options settings and functions used to render
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    _offset: Vector,
    resolution: Vector,
    options: MenuRenderConfig<T>
  ) {
    const { font } = options;
    const is_sub_menu_item = options.isSubMenuItem(this);

    ctx.translate(0, options.row_offset_y ?? 0);

    ctx.save();

    if (is_sub_menu_item && options.shouldDrawDetails(this.source)) {
      const offset = new Vector(-2, -font.size);
      const detail_size = this._drawDetails(ctx, offset, resolution, options);

      if (!detail_size) {
        // TODO: This should never happen; remove this check
        throw new Error("missing detail_size. this should not happen");
      }

      // Move menu option a little bit away from the border
      ctx.translate(10, 0);

      // Render the menu option text
      this._drawOptionText(ctx, Vector.empty(), options);

      // Account for height of equipable menu on next menu item
      ctx.translate(0, detail_size.y - font.size);
    } else {
      this._drawOptionText(ctx, Vector.empty(), options);
    }

    // Render sub-menu
    if (options.isSelected(this) && this.menu) {
      const offset = new Vector(options.sub_menu_width ?? 0, 0);

      this.menu.draw(ctx, offset, resolution, options);
    }
  }

  /**
   * Handle drawing of the detail panel
   *
   * @param ctx canvas context
   * @param offset render position offset
   * @param resolution render resolution
   * @param options settings and functions used to render
   */
  private _drawDetails(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector,
    options: MenuRenderConfig<T>
  ) {
    const { source } = this;

    if (!options.shouldDrawDetails(source)) {
      return;
    }

    // y-value is not known until the description renders
    const description_size = new Vector(400, Infinity);
    // const is_equipped = "isEquipped" in source ? source.isEquipped : false;
    const badge_title = options.getBadgeTitle(this);
    const padding = new Vector(16, 16);
    const sprite_size = new Vector(64, 64);
    const sprite_padding = new Vector(16, 8);
    const description_padding = new Vector(0, 8);
    const { font } = options;
    const badge_height = badge_title ? font.subtext_size + sprite_padding.y : 0;

    description_size.y = this._drawSubtext(
      ctx,
      offset.plus(padding).plus(description_padding),
      description_size,
      options,
      source.description ?? "Description not found."
    );

    ctx.save();
    ctx.font = `${font.subtext_size}px ${font.family}`;
    const badge_width = ctx.measureText(badge_title).width;
    ctx.restore();

    const width =
      description_size.x +
      padding.x * 2 +
      Math.max(sprite_size.x, badge_width) +
      sprite_padding.x;

    const height =
      Math.max(
        description_size.y,
        sprite_size.y + sprite_padding.y + badge_height
      ) +
      padding.y * 2;

    const size = new Vector(width, height);

    this._drawBox(ctx, offset, size);

    const sprite_offset = new Vector(
      size.x - sprite_size.x - padding.x,
      padding.y + sprite_padding.y
    ).plus(offset);

    source.draw(ctx, sprite_offset, sprite_size);

    if (badge_title) {
      const text_size = new Vector(badge_width, font.subtext_size);
      const equipped_indicator_offset = offset
        .plus(size)
        .minus(text_size)
        .minus(padding);

      this._drawSubtext(
        ctx,
        equipped_indicator_offset,
        resolution,
        options,
        badge_title
      );
    }

    return size;
  }

  /**
   * Draw a box on the inventory
   *
   * @param ctx canvas context
   * @param offset render position offset
   * @param resolution render resolution
   */
  private _drawBox(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(offset.x, offset.y, resolution.x, resolution.y);
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw main text type on the inventory
   *
   * @param ctx canvas context
   * @param offset render position offset
   * @param options settings and functions used to render
   */
  private _drawOptionText(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    options: MenuRenderConfig<T>
  ) {
    const is_selected = options.isSelected(this);
    const is_main_selection = options.isCurrentOption(this);
    const text = this.menu_description;
    const { font } = options;

    ctx.font = `${font.size}px ${font.family}`;

    if (is_selected) {
      ctx.font = `bold ${ctx.font}`;
      ctx.shadowColor = font.shadow_color;
      ctx.shadowOffsetY = 4;
    }

    if (is_main_selection) {
      ctx.shadowColor = font.highlight_color;
    }

    ctx.fillText(text, offset.x, offset.y);
    ctx.restore();
  }

  /**
   * Draw the secondary type text on the inventory
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - container for the text
   * @param text       - text to draw
   *
   * @return amount of height consumed
   */
  private _drawSubtext(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector,
    render_options: MenuRenderConfig<T>,
    text: string
  ) {
    ctx.save();

    const { font } = render_options;

    ctx.font = `${font.subtext_size}px Minecraftia`;
    ctx.shadowColor = font.shadow_color;

    const buffer = new TextBuffer(text);
    const SPACING_MODIFIER = 0.4;
    const LINE_HEIGHT = Math.ceil((1 + SPACING_MODIFIER) * font.subtext_size);

    buffer.fill(ctx, resolution).forEach((text, index) => {
      // Offset by an extra line due to text being drawn from bottom left corner
      ctx.fillText(text, offset.x, offset.y + LINE_HEIGHT * (index + 1));
    });

    ctx.restore();

    return LINE_HEIGHT * buffer.read().length;
  }
}
