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
        // Create background
        this.createBackground();

        // Create player
        this.player = new Player(this,
            this.game.config.width / 2,
            this.game.config.height / 2
        );

        console.log("Player created at:", this.player.sprite.x, this.player.sprite.y);

        // Setup enemy manager
        this.enemyManager = new EnemyManager(this);

        // NOW set up weapon collisions after enemyManager is created
        this.player.setupWeaponCollisions();

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

    // Also update applyUpgrade to call setupWeaponCollisions
    applyUpgrade(upgrade) {
        if (!upgrade || typeof upgrade.apply !== 'function') {
            console.error("Invalid upgrade object:", upgrade);
            this.paused = false;
            return;
        }

        upgrade.apply();

        // Set up collisions for any new weapons
        this.player.setupWeaponCollisions();

        this.paused = false;

        // Check if still have enough XP for another level up
        if (this.currentXP >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    createParticleEmitters() {
        try {
            // Enemy death particles
            this.enemyDeathEmitter = this.add.particles(0, 0, 'enemy', {
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.4, end: 0.0 },
                lifespan: { min: 400, max: 600 },
                blendMode: 'ADD',
                frequency: -1 // Manually emitted
            });

            // XP collection particles
            this.xpCollectEmitter = this.add.particles(0, 0, 'xp', {
                speed: { min: 30, max: 80 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0.0 },
                lifespan: { min: 300, max: 500 },
                blendMode: 'ADD',
                frequency: -1 // Manually emitted
            });
        } catch (error) {
            console.warn("Error creating particle emitters:", error);
            // Create dummy emitters that do nothing to avoid errors
            this.enemyDeathEmitter = { setPosition: () => { }, explode: () => { } };
            this.xpCollectEmitter = { setPosition: () => { }, explode: () => { } };
        }
    }

    updateGameTime() {
        this.gameTime++;

        // Increase difficulty over time
        if (this.gameTime % 30 === 0) { // Every 30 seconds
            this.enemyManager.increaseDifficulty();
        }
    }

    setupCollisions() {
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

        // Weapon projectiles and enemies - KEY FIX HERE
        this.player.weapons.forEach(weapon => {
            if (weapon.projectiles) {
                this.physics.add.overlap(
                    weapon.projectiles,
                    this.enemyManager.enemies,
                    this.handleWeaponEnemyCollision,
                    null,
                    this
                );
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
            if (this.enemyDeathEmitter && typeof this.enemyDeathEmitter.setPosition === 'function') {
                this.enemyDeathEmitter.setPosition(enemySprite.x, enemySprite.y);
                this.enemyDeathEmitter.explode(12);
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
        if (this.xpCollectEmitter && typeof this.xpCollectEmitter.setPosition === 'function') {
            this.xpCollectEmitter.setPosition(xpGem.x, xpGem.y);
            this.xpCollectEmitter.explode(5);
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

        // Set up collisions for any new weapons
        this.player.weapons.forEach(weapon => {
            if (weapon.projectiles && !weapon.collisionsSetup) {
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