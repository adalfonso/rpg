export default class Weapon {
    constructor(stats) {
        for (let stat in stats) {
            this[stat] = stats[stat];
        }

        this.type = 'equipable';
    }

    use() {
        _handler.trigger('battleAction', this);
    }

}