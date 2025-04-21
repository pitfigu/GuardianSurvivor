// js/objects/weapons/AreaWeapon.js
class AreaWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player);

        // Area weapon specific properties
        this.damage = 8;
        this.cooldown = 1500;
        this.radius = 100;
        this.duration = 300; // ms effect lasts
        this.level = 1;

        // Reference to enemy manager for collision detection
        this.enemies = scene.enemyManager ? scene.enemyManager.enemies : null;
    }

    update(time, delta) {
        // Check if it's time to fire the weapon
        if (time > this.lastFired + this.cooldown) {
            this.fire(time);
            this.lastFired = time;
        }
    }

    fire(time) {
        // Create area effect visual
        const areaEffect = this.scene.add.sprite(
            this.player.sprite.x,
            this.player.sprite.y,
            'areaEffect'
        );
        areaEffect.setAlpha(0.7);
        areaEffect.setDepth(5); // Set to appear above most game elements

        // Start with smaller scale and expand for effect
        areaEffect.setScale(0.1);
        this.scene.tweens.add({
            targets: areaEffect,
            scale: 1,
            duration: 150,
            ease: 'Sine.easeOut'
        });

        // Play sound effect
        if (this.scene.sound && this.scene.sound.add) {
            this.scene.sound.play('hit', { volume: 0.3 });
        }

        // Apply damage to all enemies within the radius
        const enemies = this.scene.enemyManager.enemies.getChildren();

        for (const enemySprite of enemies) {
            const enemy = enemySprite.getData('ref');
            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x,
                this.player.sprite.y,
                enemySprite.x,
                enemySprite.y
            );

            if (distance <= this.radius) {
                enemy.takeDamage(this.damage);

                // Visual feedback on hit enemies
                this.scene.tweens.add({
                    targets: enemySprite,
                    alpha: 0.5,
                    duration: 50,
                    yoyo: true,
                    repeat: 1
                });

                if (enemy.health <= 0) {
                    // If enemy died, add to score and drop XP
                    this.scene.score += enemy.points;
                    enemy.dropXP();

                    // Visual effect for enemy death
                    if (this.scene.enemyDeathEmitter) {
                        this.scene.enemyDeathEmitter.setPosition(enemySprite.x, enemySprite.y);
                        this.scene.enemyDeathEmitter.explode(12);
                    }

                    // Play death sound
                    if (this.scene.sound && this.scene.sound.add) {
                        this.scene.sound.play('enemyDeath', { volume: 0.4 });
                    }

                    enemy.destroy();
                }
            }
        }

        // Animate and remove the area effect
        this.scene.tweens.add({
            targets: areaEffect,
            alpha: 0,
            scale: 1.2,
            duration: this.duration,
            onComplete: () => {
                areaEffect.destroy();
            }
        });

        // Create ripple effect
        const ripple = this.scene.add.circle(
            this.player.sprite.x,
            this.player.sprite.y,
            this.radius,
            0xffffff,
            0.3
        );
        ripple.setDepth(4); // Below the main area effect

        this.scene.tweens.add({
            targets: ripple,
            scale: 1.4,
            alpha: 0,
            duration: this.duration * 1.5,
            onComplete: () => {
                ripple.destroy();
            }
        });
    }

    upgradeLevel() {
        super.upgradeLevel();

        // Level-specific upgrades
        switch (this.level) {
            case 2:
                this.radius += 30;
                break;
            case 3:
                this.damage += 5;
                break;
            case 4:
                this.cooldown *= 0.8; // 20% faster
                break;
            case 5:
                this.radius += 50;
                this.damage += 10;
                break;
        }

        // Visual feedback for weapon upgrade
        const upgradeText = this.scene.add.text(
            this.player.sprite.x,
            this.player.sprite.y - 40,
            'Area Weapon Upgraded!',
            {
                fontSize: '16px',
                color: '#88aaff',
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

    upgradeDamage(amount) {
        this.damage += amount;

        // Visual feedback for damage upgrade
        const upgradeText = this.scene.add.text(
            this.player.sprite.x,
            this.player.sprite.y - 40,
            `+${amount} Area Damage!`,
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

    upgradeCooldown(factor) {
        this.cooldown *= factor;

        // Visual feedback for cooldown upgrade
        const upgradeText = this.scene.add.text(
            this.player.sprite.x,
            this.player.sprite.y - 40,
            `Area Attack Speed Up!`,
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