type MenuBlockOptions = ex.RasterOptions &
  ex.RectangleOptions & { pos: ex.Vector; anchor_type?: "default" | "center" };

class MenuBlock extends ex.Entity {
  constructor(options: MenuBlockOptions, name: string) {
    const { pos, anchor_type, ...rest } = options;
    const rect = new ex.Rectangle(rest);

    const graphics = new ex.GraphicsComponent({
      graphics: { default: rect },
    });

    const transform = new ex.TransformComponent();

    transform.pos = pos.clone();

    // Anchor to the top-left - common
    if ([undefined, "default"].includes(anchor_type)) {
      graphics.anchor = ex.vec(0, 0);
    }

    graphics.show("default");

    super([graphics, transform], name);
  }
}
