// js/objects/weapons/LaserWeapon.js
class LaserWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player);

        this.damage = 12;
        this.cooldown = 1200;
        this.range = 300;
        this.beamWidth = 10;
        this.beamDuration = 400;
        this.level = 1;
        this.penetrating = true; // Can hit multiple enemies

        // Create group for beam graphics
        this.beams = [];
    }

    update(time, delta) {
        if (time > this.lastFired + this.cooldown) {
            this.fire(time);
            this.lastFired = time;
        }

        // Update any active beams
        for (let i = this.beams.length - 1; i >= 0; i--) {
            const beam = this.beams[i];
            if (beam.lifeTime <= 0) {
                beam.graphics.destroy();
                this.beams.splice(i, 1);
            } else {
                beam.lifeTime -= delta;
                // Fade out beam as it expires
                const alpha = beam.lifeTime / beam.maxLifeTime;
                beam.graphics.setAlpha(alpha * 0.8);
            }
        }
    }

    fire(time) {
        // Find closest enemy
        const enemies = this.scene.enemyManager.enemies.getChildren();
        let closestEnemy = null;
        let closestDistance = this.range;

        for (const enemySprite of enemies) {
            const enemy = enemySprite.getData('ref');
            if (!enemy) continue;

            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                enemySprite.x, enemySprite.y
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }

        if (closestEnemy) {
            // Play laser sound
            if (this.scene.sound && this.scene.cache.audio.exists('shoot')) {
                this.scene.sound.play('shoot', { volume: 0.2, rate: 1.5 });
            }

            // Create beam graphics
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(this.beamWidth, 0x00ffff, 0.8);
            graphics.lineBetween(
                this.player.sprite.x, this.player.sprite.y,
                closestEnemy.sprite.x, closestEnemy.sprite.y
            );

            // Add glow effect
            graphics.lineStyle(this.beamWidth * 2, 0x00ffff, 0.2);
            graphics.lineBetween(
                this.player.sprite.x, this.player.sprite.y,
                closestEnemy.sprite.x, closestEnemy.sprite.y
            );

            // Add beam to tracking array
            this.beams.push({
                graphics,
                target: closestEnemy,
                lifeTime: this.beamDuration,
                maxLifeTime: this.beamDuration
            });

            // Deal damage to the enemy
            closestEnemy.takeDamage(this.damage);

            // Check if enemy died
            if (closestEnemy.health <= 0) {
                this.scene.score += closestEnemy.points;
                closestEnemy.dropXP();

                // Visual effect for enemy death
                if (this.scene.enemyDeathEmitter) {
                    this.scene.enemyDeathEmitter.setPosition(
                        closestEnemy.sprite.x, closestEnemy.sprite.y
                    );
                    this.scene.enemyDeathEmitter.explode(12);
                }

                // Play death sound
                if (this.scene.sound && this.scene.sound.add) {
                    this.scene.sound.play('enemyDeath', { volume: 0.4 });
                }

                closestEnemy.destroy();
            }
        }
    }

    upgradeLevel() {
        super.upgradeLevel();

        switch (this.level) {
            case 2:
                this.range += 75;
                break;
            case 3:
                this.damage += 8;
                break;
            case 4:
                this.cooldown *= 0.8;
                break;
            case 5:
                this.beamWidth += 5;
                this.damage += 10;
                break;
        }
    }
}