class Weapon {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        // Weapon properties
        this.damage = 10;
        this.cooldown = 1000; // ms
        this.lastFired = 0;
        this.level = 1;
    }

    update(time, delta) {
        if (time > this.lastFired + this.cooldown) {
            this.fire(time);
            this.lastFired = time;
        }
    }

    fire(time) {
        // Implemented in subclasses
        console.warn("fire() method not implemented");
    }

    upgradeDamage(amount) {
        this.damage += amount;
    }

    upgradeCooldown(factor) {
        this.cooldown *= factor; // Lower cooldown = faster attacks
    }

    upgradeLevel() {
        this.level++;
        // Implement specific level effects in subclasses
    }
}