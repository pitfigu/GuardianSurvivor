class BasicWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player);

        this.damage = 15;
        this.cooldown = 800;
        this.range = 100;

        // Create group for projectiles
        this.projectiles = scene.physics.add.group();
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
        // Sound effect
        this.scene.sound.play('shoot', { volume: 0.2, rate: 1.2 });

        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.player.sprite.x,
            this.player.sprite.y,
            'projectile'
        );

        // Set a small but accurate hitbox
        projectile.body.setSize(8, 2);
        projectile.body.setOffset(0, 1);

        projectile.setData('damage', this.damage);
        projectile.setData('destroyOnHit', true);

        // Add glow effect to projectile
        const glow = this.scene.add.sprite(
            this.player.sprite.x,
            this.player.sprite.y,
            'projectile'
        );
        glow.setScale(1.6);
        glow.setAlpha(0.4);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        // Add to projectiles group
        this.projectiles.add(projectile);
        this.projectiles.add(glow);

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
        glow.setVelocity(
            direction.x * speed,
            direction.y * speed
        );

        // Rotate projectiles to face direction
        projectile.rotation = Math.atan2(direction.y, direction.x);
        glow.rotation = projectile.rotation;

        // Destroy after time
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (projectile.active) projectile.destroy();
                if (glow.active) glow.destroy();
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
                this.multiShot = true;
                break;
        }
    }
}