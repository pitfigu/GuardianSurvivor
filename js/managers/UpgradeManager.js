// js/managers/UpgradeManager.js
class UpgradeManager {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;

        // Available upgrades
        this.availableUpgrades = [
            // Weapon unlocks
            { id: 'unlockArea', name: 'Area Attack', description: 'Damages enemies in an area around you', type: 'weapon', apply: this.unlockAreaWeapon.bind(this) },
            { id: 'unlockProjectile', name: 'Multi Projectile', description: 'Fires multiple projectiles in a spread', type: 'weapon', apply: this.unlockProjectileWeapon.bind(this) },

            // Weapon upgrades
            { id: 'weaponDamage', name: 'Weapon Damage +30%', description: 'Increases all weapon damage', type: 'weaponUpgrade', apply: this.upgradeWeaponDamage.bind(this) },
            { id: 'weaponSpeed', name: 'Attack Speed +20%', description: 'Decreases weapon cooldown', type: 'weaponUpgrade', apply: this.upgradeWeaponSpeed.bind(this) },
            { id: 'weaponLevel', name: 'Weapon Level Up', description: 'Improves a random weapon', type: 'weaponUpgrade', apply: this.upgradeWeaponLevel.bind(this) },

            // Player upgrades
            { id: 'playerSpeed', name: 'Movement Speed +20%', description: 'Move faster', type: 'player', apply: this.upgradePlayerSpeed.bind(this) },
            { id: 'playerHealth', name: 'Max Health +30', description: 'Increase maximum health', type: 'player', apply: this.upgradePlayerHealth.bind(this) },
            { id: 'playerHeal', name: 'Full Heal', description: 'Restore all health', type: 'player', apply: this.healPlayer.bind(this) },
        ];
    }

    getRandomUpgrades(count) {
        // Filter available upgrades
        let availableUpgrades = [...this.availableUpgrades];

        // Remove weapon unlocks if player already has all weapons
        if (this.player.weapons.length >= 3) {
            availableUpgrades = availableUpgrades.filter(upgrade => upgrade.type !== 'weapon');
        }

        // Shuffle and return requested number
        return Phaser.Utils.Array.Shuffle(availableUpgrades).slice(0, count);
    }

    applyUpgrade(upgrade) {
        upgrade.apply();
    }

    // Weapon unlock methods
    unlockAreaWeapon() {
        if (!this.player.weapons.some(w => w instanceof AreaWeapon)) {
            this.player.addWeapon(new AreaWeapon(this.scene, this.player));
        } else {
            // Already has this weapon, upgrade it instead
            this.upgradeSpecificWeapon(AreaWeapon);
        }
    }

    unlockProjectileWeapon() {
        if (!this.player.weapons.some(w => w instanceof ProjectileWeapon)) {
            this.player.addWeapon(new ProjectileWeapon(this.scene, this.player));
        } else {
            // Already has this weapon, upgrade it instead
            this.upgradeSpecificWeapon(ProjectileWeapon);
        }
    }

    // Weapon upgrade methods
    upgradeWeaponDamage() {
        this.player.weapons.forEach(weapon => {
            weapon.upgradeDamage(Math.ceil(weapon.damage * 0.3)); // +30%
        });
    }

    upgradeWeaponSpeed() {
        this.player.weapons.forEach(weapon => {
            weapon.upgradeCooldown(0.8); // 20% faster
        });
    }

    upgradeWeaponLevel() {
        // Choose random weapon
        const randomWeapon = Phaser.Utils.Array.GetRandom(this.player.weapons);
        randomWeapon.upgradeLevel();
    }

    upgradeSpecificWeapon(weaponClass) {
        const weapon = this.player.weapons.find(w => w instanceof weaponClass);
        if (weapon) {
            weapon.upgradeLevel();
        }
    }

    // Player upgrade methods
    upgradePlayerSpeed() {
        this.player.upgradeSpeed(Math.ceil(this.player.speed * 0.2)); // +20%
    }

    upgradePlayerHealth() {
        this.player.upgradeMaxHealth(30);
    }

    healPlayer() {
        this.player.health = this.player.maxHealth;
    }
}