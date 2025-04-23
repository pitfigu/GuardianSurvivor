// js/scenes/MainScene.js
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init() {
        this.gameTime = 0;
        this.score = 0;
        this.paused = false;
        this.playerLevel = 1;
        this.xpToNextLevel = GAME_SETTINGS.xpToLevelUp;
        this.currentXP = 0;
        this.playerStartPosition = {
            x: this.game.config.width / 2,
            y: this.game.config.height / 2
        };
    }

    create() {
        // Create enhanced background that properly fills the screen
        this.createEnhancedBackground();

        // Create player at center of screen
        this.player = new Player(this,
            this.playerStartPosition.x,
            this.playerStartPosition.y
        );

        console.log("Player created at:", this.player.sprite.x, this.player.sprite.y);

        // Setup enemy manager
        this.enemyManager = new EnemyManager(this);

        // Set up weapon collisions after enemyManager is created
        if (this.player && typeof this.player.setupWeaponCollisions === 'function') {
            this.player.setupWeaponCollisions();
        }

        // Setup upgrade manager
        this.upgradeManager = new UpgradeManager(this);

        // Create HUD
        this.hud = new HUD(this);

        this.pauseButtonElements = this.createPauseButton();

        // Create level up UI
        this.levelUpUI = new LevelUpUI(this);

        // Create audio manager (if available)
        try {
            if (typeof GameAudioManager !== 'undefined') {
                this.audioManager = new GameAudioManager(this);
            }
        } catch (e) {
            console.warn("GameAudioManager not available:", e);
        }

        // Create particle emitters
        this.createParticleEmitters();

        // Game timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true
        });

        // Setup collisions
        this.setupCollisions();

        // Input handlers
        this.setupInputHandlers();
    }

    createEnhancedBackground() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Create a dark gradient background
        const gradientTop = 0x111133;
        const gradientBottom = 0x221144;

        // Since Phaser doesn't have built-in gradients, we'll simulate with multiple rectangles
        for (let i = 0; i < height; i += 4) {
            const ratio = i / height;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                { r: (gradientTop >> 16) & 0xFF, g: (gradientTop >> 8) & 0xFF, b: gradientTop & 0xFF },
                { r: (gradientBottom >> 16) & 0xFF, g: (gradientBottom >> 8) & 0xFF, b: gradientBottom & 0xFF },
                100,
                ratio * 100
            );

            const rgbColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

            const rect = this.add.rectangle(width / 2, i, width, 4, rgbColor);
            rect.setOrigin(0.5, 0);
            rect.setDepth(-15);
        }

        // Create starfield background in a separate layer
        this.stars1 = this.add.tileSprite(
            width / 2,
            height / 2,
            width,
            height,
            'bgPattern'
        );
        this.stars1.setTint(0x333366);
        this.stars1.setAlpha(0.6);
        this.stars1.setDepth(-10);

        // Add a slight bloom/glow effect to the background using post-processing
        const bloomStrength = 1.5;
        const postFxPlugin = this.plugins.get('rexGlowFilterPipeline');

        if (postFxPlugin) {
            postFxPlugin.add(this.stars1, {
                intensity: 0.02,
                color: 0x4466ff
            });
        }

        // Add depth effect with a second star layer
        this.stars2 = this.add.tileSprite(
            width / 2,
            height / 2,
            width,
            height,
            'bgPattern'
        );
        this.stars2.setTint(0x4455aa);
        this.stars2.setScale(0.5);
        this.stars2.setAlpha(0.4);
        this.stars2.setDepth(-9);

        // Add nebula effects
        const nebulaColors = [0x9955ff, 0x5599ff, 0xff5599];
        for (let i = 0; i < 3; i++) {
            const color = Phaser.Utils.Array.GetRandom(nebulaColors);
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(100, 300);

            const nebula = this.add.circle(x, y, size, color, 0.03);
            nebula.setDepth(-8);

            // Make nebulas slowly pulse
            this.tweens.add({
                targets: nebula,
                alpha: 0.06,
                scale: 1.1,
                duration: 3000 + i * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Add subtle grid lines for gameplay clarity
        this.grid = this.add.grid(
            width / 2,
            height / 2,
            width * 2,
            height * 2,
            64, 64,
            undefined,
            0,
            0x4444aa,
            0.1
        );
        this.grid.setDepth(-5);

        // Add borders to indicate game boundaries
        const borderWidth = 2;
        const borderColor = 0x6666cc;

        this.add.rectangle(width / 2, borderWidth / 2, width, borderWidth, borderColor, 0.8).setDepth(1);
        this.add.rectangle(width / 2, height - borderWidth / 2, width, borderWidth, borderColor, 0.8).setDepth(1);
        this.add.rectangle(borderWidth / 2, height / 2, borderWidth, height, borderColor, 0.8).setDepth(1);
        this.add.rectangle(width - borderWidth / 2, height / 2, borderWidth, height, borderColor, 0.8).setDepth(1);
    }

    update(time, delta) {
        if (this.paused) return;

        // Update player
        if (this.player) this.player.update(time, delta);

        // Update enemies
        if (this.enemyManager) this.enemyManager.update(time, delta);

        // Update HUD
        if (this.hud) this.hud.update();

        // Update background parallax
        if (this.stars1) {
            this.stars1.tilePositionX += 0.05;
            this.stars1.tilePositionY += 0.05;
        }

        if (this.stars2) {
            this.stars2.tilePositionX += 0.1;
            this.stars2.tilePositionY += 0.1;
        }
    }

    // Method for minimap creation
    createMinimap() {
        const minimapSize = 150;
        const minimapScale = 0.1;
        const x = this.game.config.width - minimapSize - 20;
        const y = this.game.config.height - minimapSize - 20;

        // Create minimap background
        const minimapBg = this.add.rectangle(
            x, y, minimapSize, minimapSize, 0x000000, 0.7
        );
        minimapBg.setStrokeStyle(2, 0x4444aa);
        minimapBg.setScrollFactor(0);
        minimapBg.setDepth(100);

        // Create minimap container
        this.minimapContainer = this.add.container(x, y);
        this.minimapContainer.setScrollFactor(0);
        this.minimapContainer.setDepth(101);

        // Create player blip
        const playerBlip = this.add.circle(0, 0, 4, 0x44ff44);
        this.playerBlip = playerBlip;
        this.minimapContainer.add(playerBlip);

        // Enemy blips container
        this.enemyBlips = this.add.group();

        // Add minimap border
        const minimapBorder = this.add.rectangle(
            x, y, minimapSize, minimapSize
        );
        minimapBorder.setStrokeStyle(2, 0x4444aa);
        minimapBorder.setScrollFactor(0);
        minimapBorder.setDepth(102);
        minimapBorder.setFillStyle();

        // Store minimap properties
        this.minimap = {
            x, y, size: minimapSize, scale: minimapScale
        };
    }

    // Add pause button to HUD
    createPauseButton() {
        const pauseButton = this.add.circle(
            this.game.config.width - 40,
            40,
            20,
            0x333366,
            0.8
        );
        pauseButton.setStrokeStyle(2, 0x4466cc);
        pauseButton.setScrollFactor(0);
        pauseButton.setDepth(100);
        pauseButton.setInteractive({ useHandCursor: true });

        // Add pause icon
        const bar1 = this.add.rectangle(pauseButton.x - 5, pauseButton.y, 4, 14, 0xffffff);
        const bar2 = this.add.rectangle(pauseButton.x + 5, pauseButton.y, 4, 14, 0xffffff);
        bar1.setScrollFactor(0);
        bar2.setScrollFactor(0);
        bar1.setDepth(101);
        bar2.setDepth(101);

        // Add hover effect
        pauseButton.on('pointerover', () => {
            pauseButton.setScale(1.1);
            bar1.setScale(1.1);
            bar2.setScale(1.1);
        });

        pauseButton.on('pointerout', () => {
            pauseButton.setScale(1);
            bar1.setScale(1);
            bar2.setScale(1);
        });

        // Add click handler
        pauseButton.on('pointerdown', () => {
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.3 });
            }
            this.togglePause();
        });

        return { pauseButton, bar1, bar2 };
    }

    // Update minimap in the update method
    updateMinimap() {
        if (!this.player || !this.enemyManager || !this.minimap) return;

        const { x: mapX, y: mapY, size, scale } = this.minimap;

        // Update player position on minimap
        const playerMapX = (this.player.sprite.x * scale);
        const playerMapY = (this.player.sprite.y * scale);
        this.playerBlip.setPosition(playerMapX, playerMapY);

        // Clear old enemy blips
        this.enemyBlips.clear(true, true);

        // Create new blips for enemies
        const enemies = this.enemyManager.enemies.getChildren();
        for (const enemySprite of enemies) {
            const enemy = enemySprite.getData('ref');
            if (!enemy) continue;

            const enemyMapX = (enemySprite.x * scale);
            const enemyMapY = (enemySprite.y * scale);

            // Only show enemies within minimap bounds
            if (Math.abs(enemyMapX) <= size / 2 && Math.abs(enemyMapY) <= size / 2) {
                const blipSize = enemy.type === 'tank' ? 3 : 2;
                let color;

                switch (enemy.type) {
                    case 'tank': color = 0xff2222; break;
                    case 'fast': color = 0x22ffff; break;
                    default: color = 0xff4444;
                }

                const blip = this.add.circle(
                    enemyMapX, enemyMapY, blipSize, color
                );
                this.enemyBlips.add(blip);
                this.minimapContainer.add(blip);
            }
        }
    }

    createParticleEmitters() {
        try {
            // Enemy death particles
            const deathParticles = this.add.particles('enemy');
            this.enemyDeathEmitter = deathParticles.createEmitter({
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.4, end: 0.0 },
                lifespan: { min: 400, max: 600 },
                blendMode: 'ADD',
                frequency: -1,
                active: true,
                on: false
            });

            // XP collection particles
            const xpParticles = this.add.particles('xp');
            this.xpCollectEmitter = xpParticles.createEmitter({
                speed: { min: 30, max: 80 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0.0 },
                lifespan: { min: 300, max: 500 },
                blendMode: 'ADD',
                frequency: -1,
                active: true,
                on: false
            });
        } catch (error) {
            console.warn("Error creating particle emitters:", error);
            // Create dummy emitters
            this.enemyDeathEmitter = {
                setPosition: () => { },
                explode: () => { },
                emitParticleAt: () => { }
            };
            this.xpCollectEmitter = {
                setPosition: () => { },
                explode: () => { },
                emitParticleAt: () => { }
            };
        }
    }

    updateGameTime() {
        this.gameTime++;

        // Increase difficulty over time
        if (this.gameTime % 30 === 0) { // Every 30 seconds
            if (this.enemyManager) this.enemyManager.increaseDifficulty();
        }
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        // Mute toggle
        this.input.keyboard.on('keydown-M', () => {
            if (this.audioManager) {
                const muted = this.audioManager.toggleMute();
                this.showToastMessage(muted ? 'Sound Muted' : 'Sound Unmuted');
            }
        });

        // Pause game
        this.input.keyboard.on('keydown-P', () => {
            // Only if not already in level-up pause
            if (!this.levelUpUI || !this.levelUpUI.visible) {
                this.togglePause();
            }
        });

        // Emergency health (once per game, cheat)
        this.emergencyHealthUsed = false;
        this.input.keyboard.on('keydown-H', () => {
            if (!this.emergencyHealthUsed && this.player) {
                this.emergencyHealthUsed = true;

                // Restore 50% health
                const healAmount = Math.floor(this.player.maxHealth * 0.5);
                this.player.health = Math.min(
                    this.player.health + healAmount,
                    this.player.maxHealth
                );

                this.showToastMessage('EMERGENCY HEAL USED!');

                // Visual effect
                const healEffect = this.add.circle(
                    this.player.sprite.x,
                    this.player.sprite.y,
                    60, 0x00ff00, 0.2
                );

                this.tweens.add({
                    targets: healEffect,
                    scale: 2,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => healEffect.destroy()
                });
            } else if (this.emergencyHealthUsed) {
                this.showToastMessage('Emergency heal already used');
            }
        });
    }

    // Method to toggle pause
    togglePause() {
        this.paused = !this.paused;

        if (this.paused) {
            // Create pause menu
            this.showPauseMenu();

            // Stop enemies
            if (this.enemyManager && this.enemyManager.enemies) {
                this.enemyManager.enemies.getChildren().forEach(enemy => {
                    enemy.setVelocity(0, 0);
                });
            }
        } else {
            // Remove pause menu
            if (this.pauseMenu) {
                this.pauseMenu.destroy();
                this.pauseMenu = null;
            }
        }
    }

    // Method to show pause menu
    showPauseMenu() {
        // Create container for pause menu elements
        this.pauseMenu = this.add.container(0, 0);

        // Add overlay
        const overlay = this.add.rectangle(
            0, 0,
            this.game.config.width,
            this.game.config.height,
            0x000000, 0.7
        );
        overlay.setOrigin(0, 0);
        this.pauseMenu.add(overlay);

        // Add pause text
        const pauseText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 3,
            'GAME PAUSED',
            {
                fontFamily: 'Arial',
                fontSize: 48,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        pauseText.setOrigin(0.5);
        this.pauseMenu.add(pauseText);

        // Add instructions
        const instructions = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2,
            'Press P to resume\nPress M to toggle mute\nPress ESC to quit',
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        );
        instructions.setOrigin(0.5);
        this.pauseMenu.add(instructions);

        // Add current stats
        const stats = this.add.text(
            this.game.config.width / 2,
            this.game.config.height * 0.65,
            `Level: ${this.playerLevel}   Score: ${this.score}\nTime: ${this.formatTime(this.gameTime)}`,
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#aaaaff',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }
        );
        stats.setOrigin(0.5);
        this.pauseMenu.add(stats);

        // Add resume button
        const resumeButton = this.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height * 0.8,
            200, 50,
            0x225588
        );
        resumeButton.setInteractive({ useHandCursor: true });

        const resumeText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height * 0.8,
            'RESUME',
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        resumeText.setOrigin(0.5);

        resumeButton.on('pointerdown', () => {
            this.togglePause();
        });

        this.pauseMenu.add(resumeButton);
        this.pauseMenu.add(resumeText);

        // Set depth to ensure visibility
        this.pauseMenu.setDepth(1000);

        // Add ESC key to quit
        const escKey = this.input.keyboard.addKey('ESC');
        escKey.on('down', () => {
            if (this.paused) {
                this.scene.start('MenuScene');
            }
        });
    }

    // Helper method to format time
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Toast message system
    showToastMessage(message, duration = 2000) {
        const toast = this.add.text(
            this.game.config.width / 2,
            100,
            message,
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        );
        toast.setOrigin(0.5);
        toast.setScrollFactor(0);
        toast.setDepth(1000);

        // Fade in and out
        toast.alpha = 0;

        this.tweens.add({
            targets: toast,
            alpha: 1,
            y: 80,
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.time.delayedCall(duration - 600, () => {
                    this.tweens.add({
                        targets: toast,
                        alpha: 0,
                        y: 60,
                        duration: 300,
                        ease: 'Sine.easeIn',
                        onComplete: () => toast.destroy()
                    });
                });
            }
        });

        return toast;
    }

    setupCollisions() {
        if (!this.player || !this.enemyManager) return;

        // Player and enemies
        this.physics.add.overlap(
            this.player.sprite,
            this.enemyManager.enemies,
            this.handlePlayerEnemyCollision,
            null,
            this
        );

        // Player and XP gems
        this.physics.add.overlap(
            this.player.sprite,
            this.enemyManager.xpGems,
            this.collectXP,
            null,
            this
        );

        // Weapon projectiles and enemies
        this.player.weapons.forEach(weapon => {
            if (weapon && weapon.projectiles) {
                this.physics.add.overlap(
                    weapon.projectiles,
                    this.enemyManager.enemies,
                    this.handleWeaponEnemyCollision,
                    null,
                    this
                );
                weapon.collisionsSetup = true;
            }
        });
    }

    setupInputHandlers() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    handlePlayerEnemyCollision(playerSprite, enemySprite) {
        const enemy = enemySprite.getData('ref');
        if (!enemy) return; // Safety check

        const enemyId = enemySprite.getData('enemyId');
        const damageAmount = GAME_SETTINGS.enemyDamage[enemy.type] || 10;

        // Try to damage player - will return false if on cooldown
        const damageTaken = this.player.takeDamage(damageAmount, enemyId);

        if (damageTaken && this.player.health <= 0) {
            this.gameOver();
        }
    }

    handleWeaponEnemyCollision(projectile, enemySprite) {
        if (!projectile || !enemySprite) {
            console.log("Missing projectile or enemy in collision");
            return;
        }

        const enemy = enemySprite.getData('ref');
        if (!enemy) {
            console.log("Enemy reference missing in collision");
            return;
        }

        const damage = projectile.getData('damage') || 10;
        console.log(`Projectile hit enemy! Damage: ${damage}`);

        // Sound effect for hit
        if (this.sound && this.cache.audio.exists('hit')) {
            this.sound.play('hit', { volume: 0.3 });
        }

        enemy.takeDamage(damage);

        if (projectile.getData('destroyOnHit') !== false) {
            projectile.destroy();
        }

        if (enemy.health <= 0) {
            console.log("Enemy defeated!");

            // Sound effect for enemy death
            if (this.sound && this.cache.audio.exists('enemyDeath')) {
                this.sound.play('enemyDeath', { volume: 0.4 });
            }

            // Visual effect for enemy death (safely)
            try {
                if (this.enemyDeathEmitter) {
                    if (typeof this.enemyDeathEmitter.emitParticleAt === 'function') {
                        // Try emitParticleAt first
                        this.enemyDeathEmitter.emitParticleAt(enemySprite.x, enemySprite.y, 12);
                    }
                    else if (typeof this.enemyDeathEmitter.explode === 'function') {
                        // Fall back to explode if available
                        this.enemyDeathEmitter.setPosition(enemySprite.x, enemySprite.y);
                        this.enemyDeathEmitter.explode(12);
                    }
                }
            } catch (error) {
                console.warn("Particle emission failed:", error);
            }

            this.score += enemy.points;
            enemy.dropXP();
            enemy.destroy();
        }
    }

    collectXP(playerSprite, xpGem) {
        if (!xpGem) return; // Safety check

        const xpValue = xpGem.getData('xpValue') || 1;

        // Sound effect
        if (this.sound && this.cache.audio.exists('pickup')) {
            this.sound.play('pickup', { volume: 0.2 });
        }

        // Visual effect for XP collection
        try {
            if (this.xpCollectEmitter) {
                if (typeof this.xpCollectEmitter.emitParticleAt === 'function') {
                    this.xpCollectEmitter.emitParticleAt(xpGem.x, xpGem.y, 5);
                }
                else if (typeof this.xpCollectEmitter.explode === 'function') {
                    this.xpCollectEmitter.setPosition(xpGem.x, xpGem.y);
                    this.xpCollectEmitter.explode(5);
                }
            }
        } catch (error) {
            console.warn("XP particle emission failed:", error);
        }

        this.currentXP += xpValue;
        xpGem.destroy();

        // Check for level up
        if (this.currentXP >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        // Save current player position
        if (this.player && this.player.sprite) {
            this.playerStartPosition = {
                x: this.player.sprite.x,
                y: this.player.sprite.y
            };
        }

        this.playerLevel++;
        this.currentXP -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * GAME_SETTINGS.xpScaling);

        // Play level up sound
        if (this.sound && this.cache.audio.exists('levelUp')) {
            this.sound.play('levelUp', { volume: 0.7 });
        }

        // Add screen shake for dramatic effect
        this.cameras.main.shake(300, 0.01);

        // Create a flash effect
        const flash = this.add.rectangle(0, 0,
            this.game.config.width, this.game.config.height,
            0xffffff, 0.7);
        flash.setOrigin(0);
        flash.setDepth(100);
        flash.setScrollFactor(0);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                flash.destroy();
            }
        });

        // Pause game completely
        this.paused = true;

        // Stop all enemies
        if (this.enemyManager && this.enemyManager.enemies) {
            this.enemyManager.enemies.getChildren().forEach(enemySprite => {
                enemySprite.setVelocity(0, 0);
            });
        }

        // Show level up UI
        this.levelUpUI.show(this.upgradeManager.getRandomUpgrades(3));
    }

    applyUpgrade(upgrade) {
        if (!upgrade || typeof upgrade.apply !== 'function') {
            console.error("Invalid upgrade object:", upgrade);
            this.paused = false;
            return;
        }

        upgrade.apply();

        // Keep the game paused until the UI is fully hidden
        this.levelUpUI.hide(() => {
            this.paused = false;
        });

        // Check if still have enough XP for another level up
        if (this.currentXP >= this.xpToNextLevel) {
            this.time.delayedCall(500, () => {
                this.levelUp();
            });
        }
    }

    gameOver() {
        // Play game over sound
        if (this.sound && this.cache.audio.exists('gameOver')) {
            this.sound.play('gameOver', { volume: 0.7 });
        }

        // Screen shake
        this.cameras.main.shake(500, 0.03);

        // Update high score
        if (this.score > GAME_STATE.highScore) {
            GAME_STATE.highScore = this.score;
            localStorage.setItem('highScore', this.score);
        }

        // Flash effect
        this.cameras.main.flash(1000, 255, 0, 0);

        // Go to game over scene after a short delay
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                time: this.gameTime,
                level: this.playerLevel
            });
        });
    }
}