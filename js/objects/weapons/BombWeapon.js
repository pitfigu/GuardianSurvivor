// js/objects/weapons/BombWeapon.js
class BombWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player);

        this.damage = 30;
        this.cooldown = 3000;
        this.radius = 150;
        this.deployTime = 1000; // Time until explosion
        this.level = 1;

        // Create group for bombs
        this.bombs = scene.physics.add.group();
    }

    update(time, delta) {
        if (time > this.lastFired + this.cooldown) {
            this.fire(time);
            this.lastFired = time;
        }
    }

    fire(time) {
        // Create bomb at random position near player
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const x = this.player.sprite.x + Math.cos(angle) * distance;
        const y = this.player.sprite.y + Math.sin(angle) * distance;

        // Create bomb sprite
        const bomb = this.scene.physics.add.sprite(x, y, 'xp');
        bomb.setTint(0xff0000);
        bomb.setScale(2);
        bomb.setData('damage', this.damage);
        bomb.setData('radius', this.radius);
        bomb.setData('deployTime', this.deployTime);
        bomb.setData('createdAt', time);

        // Add pulsing effect
        this.scene.tweens.add({
            targets: bomb,
            scale: 2.5,
            alpha: 0.7,
            yoyo: true,
            repeat: -1,
            duration: 300
        });

        // Add countdown text
        const countdownText = this.scene.add.text(
            x, y,
            Math.ceil(this.deployTime / 1000).toString(),
            {
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        countdownText.setOrigin(0.5);
        bomb.setData('countdownText', countdownText);

        // Add to bombs group
        this.bombs.add(bomb);

        // Set timeout for explosion
        this.scene.time.addEvent({
            delay: this.deployTime,
            callback: () => this.explode(bomb),
            callbackScope: this
        });

        // Update countdown text
        const updateInterval = 200;
        const updateCount = Math.floor(this.deployTime / updateInterval);

        for (let i = 1; i <= updateCount; i++) {
            this.scene.time.addEvent({
                delay: i * updateInterval,
                callback: () => {
                    if (bomb.active && countdownText.active) {
                        const timeLeft = this.deployTime - (i * updateInterval);
                        countdownText.setText(Math.ceil(timeLeft / 1000).toString());

                        // Flash when close to explosion
                        if (timeLeft < 1000) {
                            bomb.setTint(0xffffff);
                            this.scene.time.addEvent({
                                delay: 100,
                                callback: () => {
                                    if (bomb.active) bomb.setTint(0xff0000);
                                }
                            });
                        }
                    }
                }
            });
        }
    }

    explode(bomb) {
        if (!bomb.active) return;

        const x = bomb.x;
        const y = bomb.y;
        const damage = bomb.getData('damage');
        const radius = bomb.getData('radius');

        // Play explosion sound
        if (this.scene.sound && this.scene.cache.audio.exists('hit')) {
            this.scene.sound.play('hit', { volume: 0.5, rate: 0.8 });
        }

        // Create explosion effect
        const explosion = this.scene.add.circle(
            x, y, radius, 0xff6600, 0.7
        );

        // Inner explosion
        const inner = this.scene.add.circle(
            x, y, radius * 0.6, 0xffff00, 0.8
        );

        // Animate explosion
        this.scene.tweens.add({
            targets: [explosion, inner],
            scale: 1.2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                explosion.destroy();
                inner.destroy();
            }
        });

        // Damage all enemies in radius
        const enemies = this.scene.enemyManager.enemies.getChildren();

        for (const enemySprite of enemies) {
            const enemy = enemySprite.getData('ref');
            if (!enemy) continue;

            const distance = Phaser.Math.Distance.Between(
                x, y, enemySprite.x, enemySprite.y
            );

            if (distance <= radius) {
                // Calculate damage falloff based on distance
                const damageMultiplier = 1 - (distance / radius) * 0.5;
                const actualDamage = Math.ceil(damage * damageMultiplier);

                enemy.takeDamage(actualDamage);

                // Push enemy away from explosion
                const angle = Phaser.Math.Angle.Between(
                    x, y, enemySprite.x, enemySprite.y
                );

                const force = 200 * (1 - distance / radius);
                enemySprite.body.velocity.x += Math.cos(angle) * force;
                enemySprite.body.velocity.y += Math.sin(angle) * force;

                // Check if enemy died
                if (enemy.health <= 0) {
                    this.scene.score += enemy.points;
                    enemy.dropXP();
                    enemy.destroy();
                }
            }
        }

        // Remove the bomb and its countdown text
        const countdownText = bomb.getData('countdownText');
        if (countdownText) countdownText.destroy();
        bomb.destroy();
    }

    upgradeLevel() {
        super.upgradeLevel();

        switch (this.level) {
            case 2:
                this.damage += 15;
                break;
            case 3:
                this.radius += 50;
                break;
            case 4:
                this.cooldown *= 0.7; // 30% faster
                break;
            case 5:
                // Bomb splits into smaller bombs
                this.damage += 10;
                break;
        }
    }
}