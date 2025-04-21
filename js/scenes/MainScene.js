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
        // Create a bright background so we can see what's happening
        const bg = this.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height / 2,
            this.game.config.width,
            this.game.config.height,
            0x333366
        );

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
        );

        // Initialize debugger
        this.debugger = new GameDebugger(this);

        // Create player - make sure it's at the center of the screen
        this.player = new Player(this,
            this.game.config.width / 2,
            this.game.config.height / 2
        );

        console.log("Player created at:", this.player.sprite.x, this.player.sprite.y);

        // Setup enemy manager
        this.enemyManager = new EnemyManager(this);

        // Setup upgrade manager
        this.upgradeManager = new UpgradeManager(this);

        // Create HUD
        this.hud = new HUD(this);

        // Create tiled background
        this.background = this.add.tileSprite(0, 0, this.game.config.width * 2, this.game.config.height * 2, 'bgPattern');
        this.background.setOrigin(0.25, 0.25);

        // Create level up UI
        this.levelUpUI = new LevelUpUI(this);

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

        // Initialize debugger after everything is set up
        this.debugger.initialize();
        this.debugger.highlightPlayer();
    }

    update(time, delta) {
        if (this.paused) return;

        // Update player
        this.player.update(time, delta);

        // Update enemies
        this.enemyManager.update(time, delta);

        // Update HUD
        this.hud.update();

        // Update debugger
        if (this.debugger) this.debugger.update();
    }

    updateGameTime() {
        this.gameTime++;

        // Increase difficulty over time
        if (this.gameTime % 30 === 0) { // Every 30 seconds
            this.enemyManager.increaseDifficulty();
        }
    }

    createParticleEmitters() {
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

        // Player's weapons and enemies
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
        this.player.takeDamage(enemy.damage);

        if (this.player.health <= 0) {
            this.gameOver();
        }
    }

    handleWeaponEnemyCollision(projectile, enemySprite) {
        const enemy = enemySprite.getData('ref');
        const damage = projectile.getData('damage') || 10;

        // Sound effect and small hit flash
        this.sound.play('hit', { volume: 0.3 });

        enemy.takeDamage(damage);
        if (projectile.getData('destroyOnHit') !== false) {
            projectile.destroy();
        }

        if (enemy.health <= 0) {
            // Play death sound
            this.sound.play('enemyDeath', { volume: 0.4 });

            // Emit particle effect
            this.enemyDeathEmitter.setPosition(enemySprite.x, enemySprite.y);
            this.enemyDeathEmitter.explode(12);

            this.score += enemy.points;
            enemy.dropXP();
            enemy.destroy();
        }
    }

    collectXP(playerSprite, xpGem) {
        const xpValue = xpGem.getData('xpValue') || 1;

        // Sound effect
        this.sound.play('pickup', { volume: 0.2 });

        // Particle effect
        this.xpCollectEmitter.setPosition(xpGem.x, xpGem.y);
        this.xpCollectEmitter.explode(5);

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
        this.sound.play('levelUp', { volume: 0.7 });

        // Create a flash effect
        const flash = this.add.rectangle(0, 0,
            this.game.config.width, this.game.config.height,
            0xffffff, 0.7);
        flash.setOrigin(0);
        flash.setDepth(100);

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
        this.upgradeManager.applyUpgrade(upgrade);
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