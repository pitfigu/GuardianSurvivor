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
            { id: 'unlockLaser', name: 'Laser Beam', description: 'Fires a penetrating laser beam', type: 'weapon', apply: this.unlockLaserWeapon.bind(this) },
            { id: 'unlockBomb', name: 'Time Bomb', description: 'Deploys bombs that explode after a delay', type: 'weapon', apply: this.unlockBombWeapon.bind(this) },

            // Weapon upgrades
            { id: 'weaponDamage', name: 'Weapon Damage +30%', description: 'Increases all weapon damage', type: 'weaponUpgrade', apply: this.upgradeWeaponDamage.bind(this) },
            { id: 'weaponSpeed', name: 'Attack Speed +20%', description: 'Decreases weapon cooldown', type: 'weaponUpgrade', apply: this.upgradeWeaponSpeed.bind(this) },
            { id: 'weaponLevel', name: 'Weapon Level Up', description: 'Improves a random weapon', type: 'weaponUpgrade', apply: this.upgradeWeaponLevel.bind(this) },
            { id: 'weaponRange', name: 'Weapon Range +25%', description: 'Increases attack distance', type: 'weaponUpgrade', apply: this.upgradeWeaponRange.bind(this) },

            // Player upgrades
            { id: 'playerSpeed', name: 'Movement Speed +20%', description: 'Move faster', type: 'player', apply: this.upgradePlayerSpeed.bind(this) },
            { id: 'playerHealth', name: 'Max Health +30', description: 'Increase maximum health', type: 'player', apply: this.upgradePlayerHealth.bind(this) },
            { id: 'playerHeal', name: 'Full Heal', description: 'Restore all health', type: 'player', apply: this.healPlayer.bind(this) },
            { id: 'playerArmor', name: 'Damage Reduction', description: 'Take 15% less damage', type: 'player', apply: this.upgradePlayerArmor.bind(this) },
            { id: 'playerRegeneration', name: 'Health Regen', description: 'Slowly regenerate health', type: 'player', apply: this.addPlayerRegeneration.bind(this) },
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

    unlockLaserWeapon() {
        if (!this.player.weapons.some(w => w instanceof LaserWeapon)) {
            this.player.addWeapon(new LaserWeapon(this.scene, this.player));
        } else {
            this.upgradeSpecificWeapon(LaserWeapon);
        }
    }

    unlockBombWeapon() {
        if (!this.player.weapons.some(w => w instanceof BombWeapon)) {
            this.player.addWeapon(new BombWeapon(this.scene, this.player));
        } else {
            this.upgradeSpecificWeapon(BombWeapon);
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

    upgradeWeaponRange() {
        this.player.weapons.forEach(weapon => {
            if (weapon.range) {
                weapon.range = Math.floor(weapon.range * 1.25); // +25%
            }
        });
    }

    upgradePlayerArmor() {
        // Initialize damage reduction if not set
        if (typeof this.player.damageReduction !== 'number') {
            this.player.damageReduction = 0;
        }

        // Add 15% damage reduction (stacks multiplicatively)
        this.player.damageReduction += 0.15;

        // Cap at 75% reduction
        if (this.player.damageReduction > 0.75) {
            this.player.damageReduction = 0.75;
        }
    }

    addPlayerRegeneration() {
        // Initialize regen if not set
        if (typeof this.player.healthRegen !== 'number') {
            this.player.healthRegen = 0;

            // Start regen timer
            this.scene.time.addEvent({
                delay: 1000,
                callback: () => {
                    if (this.player.healthRegen > 0 &&
                        this.player.health < this.player.maxHealth) {
                        this.player.health = Math.min(
                            this.player.health + this.player.healthRegen,
                            this.player.maxHealth
                        );
                    }
                },
                callbackScope: this,
                loop: true
            });
        }

        // Add 1 HP per second regen
        this.player.healthRegen += 1;
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