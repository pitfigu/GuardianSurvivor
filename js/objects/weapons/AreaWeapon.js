class AreaWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player);

        this.damage = 8;
        this.cooldown = 1500;
        this.radius = 100;
        this.duration = 300; // ms effect lasts
    }

    fire(time) {
        // Create area effect visual
        const areaEffect = this.scene.add.circle(
            this.player.sprite.x,
            this.player.sprite.y,
            this.radius,
            0xffff00,
            0.3
        );

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
                if (enemy.health <= 0) {
                    this.scene.score += enemy.points;
                    enemy.dropXP();
                    enemy.destroy();
                }
            }
        }

        // Animate and remove the area effect
        this.scene.tweens.add({
            targets: areaEffect,
            alpha: 0,
            scale: 1.5,
            duration: this.duration,
            onComplete: () => {
                areaEffect.destroy();
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
    }
}