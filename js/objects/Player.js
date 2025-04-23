// js/objects/Player.js
class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create player sprite with improved visibility
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setData('ref', this);

        this.damageCooldowns = new Map(); // Track cooldown per enemy
        this.invulnerableUntil = 0; // Global invulnerability
        this.damageFlashing = false; // Track if player is flashing

        // Make player more visible and ensure proper scaling
        this.sprite.setScale(1.2);
        this.sprite.setTint(0x4488ff);
        this.sprite.setDepth(10);
        this.sprite.setAlpha(1);

        console.log("Player sprite created:", this.sprite);

        // Add shadow beneath player
        this.shadow = scene.add.ellipse(x, y + 10, 24, 8, 0x000000, 0.5);
        this.shadow.setDepth(9);

        // Add glowing aura
        this.aura = scene.add.sprite(x, y, 'player');
        this.aura.setScale(1.6);
        this.aura.setAlpha(0.3);
        this.aura.setTint(0x00ffff);
        this.aura.setBlendMode(Phaser.BlendModes.ADD);
        this.aura.setDepth(9);

        // Add pulsing effect to aura
        scene.tweens.add({
            targets: this.aura,
            scale: 1.8,
            alpha: 0.2,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Player stats
        this.health = GAME_SETTINGS.playerHealth;
        this.maxHealth = GAME_SETTINGS.playerHealth;
        this.speed = GAME_SETTINGS.playerSpeed;

        // Weapons array
        this.weapons = [];
        this.addWeapon(new BasicWeapon(scene, this));

        // Add small light particles around player
        try {
            const particles = scene.add.particles(x, y, 'xp', {
                scale: { start: 0.2, end: 0 },
                speed: { min: 10, max: 20 },
                quantity: 1,
                frequency: 200,
                lifespan: 1000,
                alpha: { start: 0.5, end: 0 },
                blendMode: 'ADD'
            });
            particles.setDepth(11);
            this.particles = particles;
        } catch (e) {
            console.warn("Could not create player particles", e);
        }
    }

    update(time, delta) {
        this.handleMovement();
        this.updateWeapons(time, delta);

        // Update shadow position
        if (this.shadow) {
            this.shadow.x = this.sprite.x;
            this.shadow.y = this.sprite.y + 10;
        }

        // Update aura position
        if (this.aura) {
            this.aura.x = this.sprite.x;
            this.aura.y = this.sprite.y;
        }

        // Update particles position
        if (this.particles) {
            this.particles.setPosition(this.sprite.x, this.sprite.y);
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

    takeDamage(amount, enemyId = null) {
        const currentTime = this.scene.time.now;

        // Skip damage if player is invulnerable or the enemy is on cooldown
        if (currentTime < this.invulnerableUntil) return false;
        if (enemyId && this.damageCooldowns.has(enemyId)) {
            if (currentTime < this.damageCooldowns.get(enemyId)) return false;
        }

        // Apply damage and set cooldowns
        this.health -= amount;
        this.health = Math.max(0, this.health);

        // Set invulnerability for 500ms (global protection)
        this.invulnerableUntil = currentTime + 500;

        // Set individual enemy cooldown for 1 second
        if (enemyId) {
            this.damageCooldowns.set(enemyId, currentTime + 1000);
        }

        // Clean up old cooldowns every 5 seconds to prevent memory leaks
        if (Math.random() < 0.1) this.cleanupCooldowns();

        // Visual feedback - only if not already flashing
        if (!this.damageFlashing) {
            this.damageFlashing = true;

            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    this.sprite.alpha = 1;
                    this.damageFlashing = false;
                }
            });

            // Screen shake
            this.scene.cameras.main.shake(100, 0.01);

            // Flash red
            this.sprite.setTint(0xff0000);
            this.scene.time.delayedCall(300, () => {
                this.sprite.setTint(0x4488ff);
            });

            // Show damage number
            const damageText = this.scene.add.text(
                this.sprite.x, this.sprite.y - 20,
                `-${amount}`,
                { fontSize: '16px', color: '#ff0000', stroke: '#000000', strokeThickness: 3 }
            );
            damageText.setOrigin(0.5);

            this.scene.tweens.add({
                targets: damageText,
                y: damageText.y - 30,
                alpha: 0,
                duration: 800,
                onComplete: () => damageText.destroy()
            });

            // Play hurt sound
            playSound(this.scene, 'playerHurt', { volume: 0.4 });
        }

        return true; // Damage was applied
    }

    // Add this cleanup method
    cleanupCooldowns() {
        const currentTime = this.scene.time.now;
        for (const [enemyId, cooldownTime] of this.damageCooldowns.entries()) {
            if (cooldownTime < currentTime) {
                this.damageCooldowns.delete(enemyId);
            }
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