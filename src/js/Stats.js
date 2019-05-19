export default class Stats {

    constructor(stats) {
        for (let stat in stats) {
            this['base_' + stat] = stats[stat];
        }

        this.lvl = 1;
        this.experience = 0;
        this.damage = 0;
    }

    get hp() {
        return Math.max(0, this.base_hp - this.damage);
    }

    get atk() { return this.base_atk; }
    get def() { return this.base_def; }
    get sp_atk() { return this.base_sp_atk; }
    get sp_def() { return this.base_sp_def; }
    get spd() { return this.base_spd; }

    get givesExperience() {
        return this.base_hp +
            this.base_atk +
            this.base_def +
            this.base_sp_atk +
            this.base_sp_def +
            this.base_spd;
    }

    endure(damage) {
        this.damage += damage;
    }

    gainExperience(exp) {
        this.experience += exp;
    }
}