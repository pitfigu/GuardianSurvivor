class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create player sprite with improved visuals
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setData('ref', this);

        // Add shadow beneath player
        this.shadow = scene.add.ellipse(x, y + 22, 36, 12, 0x000000, 0.3);

        // Add glow effect
        this.glow = scene.add.sprite(x, y, 'player');
        this.glow.setAlpha(0.5);
        this.glow.setScale(1.2);
        this.glow.setBlendMode(Phaser.BlendModes.ADD);

        // Player stats
        this.health = GAME_SETTINGS.playerHealth;
        this.maxHealth = GAME_SETTINGS.playerHealth;
        this.speed = GAME_SETTINGS.playerSpeed;

        // Weapons array
        this.weapons = [];
        this.addWeapon(new BasicWeapon(scene, this));

        // Add pulsating effect to the glow
        scene.tweens.add({
            targets: this.glow,
            alpha: 0.7,
            scaleX: 1.3,
            scaleY: 1.3,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 1500
        });
    }

    update(time, delta) {
        this.handleMovement();
        this.updateWeapons(time, delta);

        // Update shadow and glow positions
        if (this.shadow) {
            this.shadow.x = this.sprite.x;
            this.shadow.y = this.sprite.y + 22;
        }

        if (this.glow) {
            this.glow.x = this.sprite.x;
            this.glow.y = this.sprite.y;
        }
    }

    handleMovement() {
        // Get references to keyboard input
        const { cursors } = this.scene;
        const wasd = this.scene.wasd;

        // Reset velocity
        this.sprite.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown || wasd.left.isDown) {
            this.sprite.setVelocityX(-this.speed);
        } else if (cursors.right.isDown || wasd.right.isDown) {
            this.sprite.setVelocityX(this.speed);
        }

        // Vertical movement
        if (cursors.up.isDown || wasd.up.isDown) {
            this.sprite.setVelocityY(-this.speed);
        } else if (cursors.down.isDown || wasd.down.isDown) {
            this.sprite.setVelocityY(this.speed);
        }

        // Normalize diagonal movement
        this.sprite.body.velocity.normalize().scale(this.speed);
    }

    updateWeapons(time, delta) {
        this.weapons.forEach(weapon => {
            weapon.update(time, delta);
        });
    }

    addWeapon(weapon) {
        this.weapons.push(weapon);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health);

        // Visual feedback
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });

        if (this.health <= 0) {
            // Player death logic handled in MainScene
        }
    }

    heal(amount) {
        this.health += amount;
        this.health = Math.min(this.maxHealth, this.health);
    }

    upgradeSpeed(amount) {
        this.speed += amount;
    }

    upgradeMaxHealth(amount) {
        this.maxHealth += amount;
        this.health += amount; // Also heal when max health increases
    }
}