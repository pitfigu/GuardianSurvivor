// js/objects/Player.js
class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create player sprite
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setData('ref', this);

        // Make player more visible and ensure proper scaling
        this.sprite.setScale(1.2);
        this.sprite.setTint(0x4488ff);
        this.sprite.setDepth(10);
        this.sprite.setAlpha(1);

        console.log("Player sprite created:", this.sprite);

        // Add shadow beneath player
        this.shadow = scene.add.ellipse(x, y + 10, 24, 8, 0x000000, 0.5);
        this.shadow.setDepth(9);

        // Add glowing aura - use the same texture as player to avoid frame errors
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

        // Initialize damage cooldowns
        this.damageCooldowns = new Map();
        this.invulnerableUntil = 0;
        this.damageFlashing = false;

        // Movement properties
        this.useMouseControl = true; // Set to true to enable mouse control
        this.targetPosition = new Phaser.Math.Vector2(x, y);
        this.movementThreshold = 5; // Minimum distance to move
        this.isLocked = false; // Used to lock position during upgrades

        // Player stats
        this.health = GAME_SETTINGS.playerHealth;
        this.maxHealth = GAME_SETTINGS.playerHealth;
        this.speed = GAME_SETTINGS.playerSpeed;

        // Weapons array
        this.weapons = [];
        this.addWeapon(new BasicWeapon(scene, this));

        // Setup mouse control if enabled
        if (this.useMouseControl) {
            this.setupMouseControl();
        }

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
        if (!this.isLocked) {
            if (this.useMouseControl) {
                this.handleMouseMovement();
            } else {
                this.handleKeyboardMovement();
            }
        } else {
            // When locked, make sure the player doesn't move
            this.sprite.setVelocity(0, 0);
        }

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

    setupMouseControl() {
        // Setup pointer move tracking
        this.scene.input.on('pointermove', (pointer) => {
            if (this.scene.paused || this.isLocked) return;

            // Convert screen position to world position
            const worldX = pointer.x + this.scene.cameras.main.scrollX;
            const worldY = pointer.y + this.scene.cameras.main.scrollY;

            // Update target position
            this.targetPosition.x = worldX;
            this.targetPosition.y = worldY;
        });

        // Also allow clicking to set target
        this.scene.input.on('pointerdown', (pointer) => {
            if (this.scene.paused || this.isLocked) return;

            // Convert screen position to world position
            const worldX = pointer.x + this.scene.cameras.main.scrollX;
            const worldY = pointer.y + this.scene.cameras.main.scrollY;

            // Update target position
            this.targetPosition.x = worldX;
            this.targetPosition.y = worldY;
        });
    }

    handleMouseMovement() {
        // Calculate distance to target
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            this.targetPosition.x, this.targetPosition.y
        );

        // Only move if we're far enough from the target
        if (distance > this.movementThreshold) {
            // Calculate direction to target
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x, this.sprite.y,
                this.targetPosition.x, this.targetPosition.y
            );

            // Set velocity based on direction and player speed
            this.sprite.setVelocityX(Math.cos(angle) * this.speed);
            this.sprite.setVelocityY(Math.sin(angle) * this.speed);

            // Face direction of movement (optional)
            this.sprite.rotation = angle + Math.PI / 2; // Adjust based on sprite orientation
        } else {
            // Close enough to target, stop moving
            this.sprite.setVelocity(0);
        }
    }

    handleKeyboardMovement() {
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
        // Skip damage entirely if player is locked (during level up)
        if (this.isLocked) return false;

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

    // Lock player position (used during level-up or pause)
    lockPosition() {
        this.isLocked = true;
        this.sprite.setVelocity(0, 0);
    }

    // Unlock player position
    unlockPosition() {
        this.isLocked = false;
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

        // Visual indicator for healing
        const healText = this.scene.add.text(
            this.sprite.x, this.sprite.y - 20,
            `+${amount} HP`,
            { fontSize: '16px', color: '#00ff00', stroke: '#000000', strokeThickness: 3 }
        );
        healText.setOrigin(0.5);

        this.scene.tweens.add({
            targets: healText,
            y: healText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => healText.destroy()
        });
    }

    upgradeSpeed(amount) {
        this.speed += amount;

        // Visual indicator for speed upgrade
        const speedText = this.scene.add.text(
            this.sprite.x, this.sprite.y - 20,
            `Speed +${amount}`,
            { fontSize: '16px', color: '#00ffff', stroke: '#000000', strokeThickness: 3 }
        );
        speedText.setOrigin(0.5);

        this.scene.tweens.add({
            targets: speedText,
            y: speedText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => speedText.destroy()
        });
    }

    upgradeMaxHealth(amount) {
        this.maxHealth += amount;
        this.health += amount; // Also heal when max health increases

        // Visual indicator for health upgrade
        const healthText = this.scene.add.text(
            this.sprite.x, this.sprite.y - 20,
            `Max HP +${amount}`,
            { fontSize: '16px', color: '#ff88ff', stroke: '#000000', strokeThickness: 3 }
        );
        healthText.setOrigin(0.5);

        this.scene.tweens.add({
            targets: healthText,
            y: healthText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => healthText.destroy()
        });
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

    // Toggle between mouse and keyboard control
    toggleControlMethod() {
        this.useMouseControl = !this.useMouseControl;
        return this.useMouseControl;
    }
}