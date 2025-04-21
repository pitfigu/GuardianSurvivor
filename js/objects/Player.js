// js/objects/Player.js
class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create player sprite
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setData('ref', this);

        // Make sure player is visible
        this.sprite.setVisible(true);
        this.sprite.setAlpha(1);
        this.sprite.setDepth(10);

        console.log("Player sprite created:", this.sprite);

        // Add shadow beneath player
        this.shadow = scene.add.ellipse(x, y + 10, 24, 8, 0x000000, 0.5);
        this.shadow.setDepth(9);

        // Player stats
        this.health = GAME_SETTINGS.playerHealth;
        this.maxHealth = GAME_SETTINGS.playerHealth;
        this.speed = GAME_SETTINGS.playerSpeed;

        // Weapons array
        this.weapons = [];

        // Add initial weapon (without setting up collisions yet)
        this.addWeapon(new BasicWeapon(scene, this));
    }

    update(time, delta) {
        this.handleMovement();
        this.updateWeapons(time, delta);

        // Update shadow position
        if (this.shadow) {
            this.shadow.x = this.sprite.x;
            this.shadow.y = this.sprite.y + 10;
        }
    }

    handleMovement() {
        // Get references to keyboard input
        const { cursors } = this.scene;
        const wasd = this.scene.wasd;

        // Reset velocity
        this.sprite.setVelocity(0);

        // Horizontal movement
        if ((cursors && cursors.left.isDown) || (wasd && wasd.left.isDown)) {
            this.sprite.setVelocityX(-this.speed);
        } else if ((cursors && cursors.right.isDown) || (wasd && wasd.right.isDown)) {
            this.sprite.setVelocityX(this.speed);
        }

        // Vertical movement
        if ((cursors && cursors.up.isDown) || (wasd && wasd.up.isDown)) {
            this.sprite.setVelocityY(-this.speed);
        } else if ((cursors && cursors.down.isDown) || (wasd && wasd.down.isDown)) {
            this.sprite.setVelocityY(this.speed);
        }

        // Normalize diagonal movement
        if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
            this.sprite.body.velocity.normalize().scale(this.speed);
        }
    }

    updateWeapons(time, delta) {
        this.weapons.forEach(weapon => {
            if (weapon && typeof weapon.update === 'function') {
                weapon.update(time, delta);
            }
        });
    }

    addWeapon(weapon) {
        this.weapons.push(weapon);
        // We'll set up collisions later in MainScene.setupCollisions()
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

    // Method to set up collision detection for all weapons
    setupWeaponCollisions() {
        // Only proceed if enemyManager exists
        if (!this.scene.enemyManager || !this.scene.enemyManager.enemies) {
            console.warn("Cannot set up weapon collisions - enemyManager not available");
            return;
        }

        this.weapons.forEach(weapon => {
            if (weapon && weapon.projectiles) {
                this.scene.physics.add.overlap(
                    weapon.projectiles,
                    this.scene.enemyManager.enemies,
                    this.scene.handleWeaponEnemyCollision,
                    null,
                    this.scene
                );
                weapon.collisionsSetup = true;
            }
        });
    }
}