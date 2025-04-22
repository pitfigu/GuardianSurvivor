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
    }

    create() {
        // Create a simple background color instead of using createBackground
        this.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height / 2,
            this.game.config.width,
            this.game.config.height,
            0x222244
        ).setDepth(-10);

        // Create a grid for visual reference
        const grid = this.add.grid(
            this.game.config.width / 2,
            this.game.config.height / 2,
            this.game.config.width,
            this.game.config.height,
            64,
            64,
            0x000000,
            0,
            0x444444,
            0.2
        ).setDepth(-5);

        // Create player
        this.player = new Player(this,
            this.game.config.width / 2,
            this.game.config.height / 2
        );

        console.log("Player created at:", this.player.sprite.x, this.player.sprite.y);

        // Setup enemy manager
        this.enemyManager = new EnemyManager(this);

        // NOW set up weapon collisions after enemyManager is created
        if (this.player && typeof this.player.setupWeaponCollisions === 'function') {
            this.player.setupWeaponCollisions();
        }

        // Setup upgrade manager
        this.upgradeManager = new UpgradeManager(this);

        // Create HUD
        this.hud = new HUD(this);

        // Create level up UI
        this.levelUpUI = new LevelUpUI(this);

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

        // Initialize debugger if available
        if (typeof GameDebugger !== 'undefined') {
            this.debugger = new GameDebugger(this);
            this.debugger.initialize();
            this.debugger.highlightPlayer();
        }
    }

    update(time, delta) {
        if (this.paused) return;

        // Update player
        if (this.player) this.player.update(time, delta);

        // Update enemies
        if (this.enemyManager) this.enemyManager.update(time, delta);

        // Update HUD
        if (this.hud) this.hud.update();

        // Update debugger
        if (this.debugger) this.debugger.update();

        // Slowly animate the background grid
        if (this.background) {
            this.background.tilePositionX += 0.1;
            this.background.tilePositionY += 0.1;
        }
    }

    createParticleEmitters() {
        try {
            // Create particle managers first
            const deathParticles = this.add.particles('enemy');
            const xpParticles = this.add.particles('xp');

            // Then create emitters
            this.enemyDeathEmitter = deathParticles.createEmitter({
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.4, end: 0.0 },
                lifespan: { min: 400, max: 600 },
                blendMode: 'ADD',
                frequency: -1, // Manually emitted
                active: true,
                on: false // Not emitting automatically
            });

            this.xpCollectEmitter = xpParticles.createEmitter({
                speed: { min: 30, max: 80 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0.0 },
                lifespan: { min: 300, max: 500 },
                blendMode: 'ADD',
                frequency: -1, // Manually emitted
                active: true,
                on: false // Not emitting automatically
            });
        } catch (error) {
            console.warn("Error creating particle emitters:", error);
            // Create dummy emitters with all the methods we use
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

        this.player.takeDamage(enemy.damage);

        // Sound effect 
        if (this.sound && this.cache.audio.exists('playerHurt')) {
            this.sound.play('playerHurt', { volume: 0.4 });
        }

        if (this.player.health <= 0) {
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
        this.playerLevel++;
        this.currentXP -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * GAME_SETTINGS.xpScaling);

        // Play level up sound
        if (this.sound && this.cache.audio.exists('levelUp')) {
            this.sound.play('levelUp', { volume: 0.7 });
        }

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

        // Pause game and show level up UI
        this.paused = true;
        this.levelUpUI.show(this.upgradeManager.getRandomUpgrades(3));
    }

    applyUpgrade(upgrade) {
        if (!upgrade || typeof upgrade.apply !== 'function') {
            console.error("Invalid upgrade object:", upgrade);
            this.paused = false;
            return;
        }

        upgrade.apply();
        this.paused = false;

        // Check if still have enough XP for another level up
        if (this.currentXP >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    gameOver() {
        // Update high score
        if (this.score > GAME_STATE.highScore) {
            GAME_STATE.highScore = this.score;
            localStorage.setItem('highScore', this.score);
        }

        // Go to game over scene
        this.scene.start('GameOverScene', {
            score: this.score,
            time: this.gameTime,
            level: this.playerLevel
        });
    }
}