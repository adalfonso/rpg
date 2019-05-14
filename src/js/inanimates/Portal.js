import BaseInanimate from "./BaseInanimate";

export default class Portal extends BaseInanimate {
    constructor(pos, size, obj) {
        super(pos, size);

        if (obj && obj.properties) {
            obj.properties.forEach(prop => {
                this[prop.name] = prop.value;
            });
        }
    }

    draw(ctx) {
        super.draw(ctx);
    }
}