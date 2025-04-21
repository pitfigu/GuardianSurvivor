// js/objects/weapons/BasicWeapon.js
class BasicWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player);

        this.damage = 15;
        this.cooldown = 800;
        this.range = 100;
        this.level = 1;
        this.collisionsSetup = false;

        // Create group for projectiles
        this.projectiles = scene.physics.add.group();
    }

    update(time, delta) {
        if (time > this.lastFired + this.cooldown) {
            this.fire(time);
            this.lastFired = time;
        }

        // Remove projectiles that have gone too far off-screen
        const projectiles = this.projectiles.getChildren();
        for (let i = 0; i < projectiles.length; i++) {
            const p = projectiles[i];
            if (p.active) {
                if (p.x < -50 || p.x > this.scene.game.config.width + 50 ||
                    p.y < -50 || p.y > this.scene.game.config.height + 50) {
                    p.destroy();
                }
            }
        }
    }

    fire(time) {
        // Find closest enemy within range
        const enemies = this.scene.enemyManager.enemies.getChildren();
        let closestEnemy = null;
        let closestDistance = this.range;

        for (const enemySprite of enemies) {
            const enemy = enemySprite.getData('ref');
            if (!enemy) continue; // Skip if no reference

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
        // Try to play sound
        if (this.scene.sound && this.scene.cache.audio.exists('shoot')) {
            this.scene.sound.play('shoot', { volume: 0.2, rate: 1.2 });
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
        projectile.setData('weaponType', 'basic');

        // Add a trail effect
        const trail = this.scene.add.particles(0, 0, 'projectile', {
            follow: projectile,
            lifespan: 200,
            scale: { start: 1.0, end: 0 },
            alpha: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            quantity: 1,
            frequency: 30
        });

        // Store trail reference for cleanup
        projectile.setData('trail', trail);

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

        // Destroy after time or when going off-screen
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (projectile.active) {
                    // Clean up trail
                    const trail = projectile.getData('trail');
                    if (trail) trail.destroy();

                    // Destroy projectile
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
                this.range += 25;
                break;
        }

        // Visual feedback
        if (this.player && this.player.sprite && this.player.sprite.active) {
            const upgradeText = this.scene.add.text(
                this.player.sprite.x,
                this.player.sprite.y - 40,
                `Basic Weapon Upgraded! (Lvl ${this.level})`,
                {
                    fontSize: '16px',
                    color: '#ffff00',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            );
            upgradeText.setOrigin(0.5);

            this.scene.tweens.add({
                targets: upgradeText,
                y: upgradeText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    upgradeText.destroy();
                }
            });
        }
    }

    upgradeDamage(amount) {
        this.damage += amount;

        // Visual feedback
        if (this.player && this.player.sprite && this.player.sprite.active) {
            const upgradeText = this.scene.add.text(
                this.player.sprite.x,
                this.player.sprite.y - 40,
                `+${amount} Basic Weapon Damage!`,
                {
                    fontSize: '16px',
                    color: '#ff8866',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            );
            upgradeText.setOrigin(0.5);

            this.scene.tweens.add({
                targets: upgradeText,
                y: upgradeText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    upgradeText.destroy();
                }
            });
        }
    }

    upgradeCooldown(factor) {
        this.cooldown *= factor;

        // Visual feedback
        if (this.player && this.player.sprite && this.player.sprite.active) {
            const upgradeText = this.scene.add.text(
                this.player.sprite.x,
                this.player.sprite.y - 40,
                `Attack Speed Up!`,
                {
                    fontSize: '16px',
                    color: '#88ff88',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            );
            upgradeText.setOrigin(0.5);

            this.scene.tweens.add({
                targets: upgradeText,
                y: upgradeText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    upgradeText.destroy();
                }
            });
        }
    }
}