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
        // Create player
        this.player = new Player(this, 400, 300);

        // Setup enemy manager
        this.enemyManager = new EnemyManager(this);

        // Setup upgrade manager
        this.upgradeManager = new UpgradeManager(this);

        // Create HUD
        this.hud = new HUD(this);

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
    }

    update(time, delta) {
        if (this.paused) return;

        // Update player
        this.player.update(time, delta);

        // Update enemies
        this.enemyManager.update(time, delta);

        // Update HUD
        this.hud.update();
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

        enemy.takeDamage(damage);
        if (projectile.getData('destroyOnHit') !== false) {
            projectile.destroy();
        }

        if (enemy.health <= 0) {
            this.score += enemy.points;
            enemy.dropXP();
            enemy.destroy();
        }
    }

    collectXP(playerSprite, xpGem) {
        const xpValue = xpGem.getData('xpValue') || 1;
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