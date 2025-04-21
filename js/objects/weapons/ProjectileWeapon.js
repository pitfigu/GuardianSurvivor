class ProjectileWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player);

        this.damage = 20;
        this.cooldown = 2000;
        this.projectileCount = 3;
        this.spread = 30; // Degrees of spread

        // Create group for projectiles
        this.projectiles = scene.physics.add.group();
    }

    fire(time) {
        const angleStep = this.spread / (this.projectileCount - 1);
        const startAngle = -this.spread / 2;

        for (let i = 0; i < this.projectileCount; i++) {
            const angle = startAngle + (angleStep * i);
            this.fireProjectile(angle);
        }
    }

    fireProjectile(angleOffset) {
        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.player.sprite.x,
            this.player.sprite.y,
            'projectile'
        );

        projectile.setTint(0xff00ff);
        projectile.setData('damage', this.damage);
        projectile.setData('destroyOnHit', true);

        // Add to projectiles group
        this.projectiles.add(projectile);

        // Calculate direction - forward relative to player with offset
        const playerFacingAngle = 0; // Assuming default is right, can change based on player movement
        const radian = Phaser.Math.DegToRad(playerFacingAngle + angleOffset);
        const direction = new Phaser.Math.Vector2(
            Math.cos(radian),
            Math.sin(radian)
        ).normalize();

        // Set velocity
        const speed = 250;
        projectile.setVelocity(
            direction.x * speed,
            direction.y * speed
        );

        // Rotate projectile to face direction
        projectile.rotation = Math.atan2(direction.y, direction.x);

        // Destroy after time
        this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                if (projectile.active) {
                    projectile.destroy();
                }
            }
        });
    }

    upgradeLevel() {
        super.upgradeLevel();

        // Level-specific upgrades
        switch (this.level) {
            case 2:
                this.projectileCount += 1;
                break;
            case 3:
                this.damage += 10;
                break;
            case 4:
                this.cooldown *= 0.8; // 20% faster
                break;
            case 5:
                this.projectileCount += 2;
                this.spread += 15;
                break;
        }
    }
}