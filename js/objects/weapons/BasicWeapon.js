// js/objects/weapons/BasicWeapon.js
class BasicWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player);

        this.damage = 15;
        this.cooldown = 800;
        this.range = 100;

        // Create group for projectiles
        this.projectiles = scene.physics.add.group();

        // Setup collision with enemies
        scene.physics.add.overlap(
            this.projectiles,
            scene.enemyManager ? scene.enemyManager.enemies : null,
            scene.handleWeaponEnemyCollision,
            null,
            scene
        );
    }

    fire(time) {
        // Find closest enemy within range
        const enemies = this.scene.enemyManager.enemies.getChildren();
        let closestEnemy = null;
        let closestDistance = this.range;

        for (const enemySprite of enemies) {
            const enemy = enemySprite.getData('ref');
            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x,
                this.player.sprite.y,
                enemySprite.x,
                enemySprite.y
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }

        if (closestEnemy) {
            this.fireAtEnemy(closestEnemy);
        }
    }

    fireAtEnemy(enemy) {
        // Play sound if available
        if (this.scene.sound && this.scene.cache.audio.exists('shoot')) {
            this.scene.sound.play('shoot', { volume: 0.2 });
        }

        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.player.sprite.x,
            this.player.sprite.y,
            'projectile'
        );

        projectile.setScale(1.2);
        projectile.setData('damage', this.damage);
        projectile.setData('destroyOnHit', true);

        // Add to projectiles group
        this.projectiles.add(projectile);

        // Calculate direction
        const direction = new Phaser.Math.Vector2(
            enemy.sprite.x - this.player.sprite.x,
            enemy.sprite.y - this.player.sprite.y
        ).normalize();

        // Set velocity
        const speed = 300;
        projectile.setVelocity(
            direction.x * speed,
            direction.y * speed
        );

        // Rotate projectile to face direction
        projectile.rotation = Math.atan2(direction.y, direction.x);

        // Add glow effect that follows the projectile
        const glowSprite = this.scene.add.sprite(
            projectile.x,
            projectile.y,
            'projectile'
        );
        glowSprite.setScale(1.6);
        glowSprite.setAlpha(0.4);
        glowSprite.setBlendMode(Phaser.BlendModes.ADD);
        glowSprite.rotation = projectile.rotation;

        // Make the glow follow the projectile
        projectile.setData('glowEffect', glowSprite);

        // Update event to keep the glow aligned with projectile
        this.scene.events.on('update', () => {
            if (projectile.active && glowSprite.active) {
                glowSprite.x = projectile.x;
                glowSprite.y = projectile.y;
            }
        });

        // Destroy after time
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (projectile.active) projectile.destroy();
                if (glowSprite.active) glowSprite.destroy();
            }
        });
    }

    upgradeLevel() {
        super.upgradeLevel();

        // Level-specific upgrades
        switch (this.level) {
            case 2:
                this.range += 50;
                break;
            case 3:
                this.cooldown *= 0.8; // 20% faster
                break;
            case 4:
                this.damage += 10;
                break;
            case 5:
                // Multi-shot at level 5
                this.damage += 5;
                this.cooldown *= 0.8;
                break;
        }
    }
}