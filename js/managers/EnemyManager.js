// js/managers/EnemyManager.js
class EnemyManager {
    constructor(scene) {
        this.scene = scene;

        // Create groups with physics
        this.enemies = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: false
        });

        this.xpGems = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: false
        });

        // Spawn rate and difficulty
        this.spawnRate = GAME_SETTINGS.baseEnemySpawnRate;
        this.difficulty = 1;
        this.enemyTypes = ['basic', 'fast', 'tank'];

        // Advanced enemy types unlocked at higher difficulties
        this.advancedEnemyTypes = ['bomber', 'teleporter', 'elite'];

        // Start spawning enemies
        this.startSpawning();

        console.log("Enemy manager initialized");
    }

    startSpawning() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta) {
        // Update each enemy
        this.enemies.getChildren().forEach(enemySprite => {
            const enemy = enemySprite.getData('ref');
            if (enemy) enemy.update();
        });
    }

    spawnEnemy() {
        // Calculate dynamic enemy cap based on player level
        const dynamicEnemyCap = GAME_SETTINGS.baseEnemyCap +
            (this.scene.playerLevel * GAME_SETTINGS.enemyCapPerLevel);

        // Check if we've reached the cap
        if (this.enemies.getChildren().length >= dynamicEnemyCap) {
            return; // Skip spawning if too many enemies
        }

        // Calculate spawn position further away from player
        const spawnDistance = 150; // Increased distance from screen edge
        const { width, height } = this.scene.sys.game.config;
        let x, y;

        // Get player position
        const playerX = this.scene.player.sprite.x;
        const playerY = this.scene.player.sprite.y;

        // Choose a random side to spawn from (top, right, bottom, left)
        const side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0: // top
                x = Phaser.Math.Between(0, width);
                y = -spawnDistance;
                break;
            case 1: // right
                x = width + spawnDistance;
                y = Phaser.Math.Between(0, height);
                break;
            case 2: // bottom
                x = Phaser.Math.Between(0, width);
                y = height + spawnDistance;
                break;
            case 3: // left
                x = -spawnDistance;
                y = Phaser.Math.Between(0, height);
                break;
        }

        // Ensure minimum distance from player
        const distToPlayer = Phaser.Math.Distance.Between(x, y, playerX, playerY);
        if (distToPlayer < 250) { // Increased minimum distance
            // Try again if too close to player
            this.spawnEnemy();
            return;
        }

        // Choose enemy type based on difficulty and randomness
        let type = this.selectEnemyType();

        // Create enemy and add to group
        const enemy = new Enemy(this.scene, x, y, type);

        // Set unique ID for damage tracking
        const enemyId = 'enemy_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        enemy.id = enemyId;
        enemy.sprite.setData('enemyId', enemyId);

        this.enemies.add(enemy.sprite);

        // Add wave spawning - occasionally spawn multiple enemies
        if (Math.random() < 0.2 && this.difficulty >= 3) {
            const waveSize = Math.min(
                Math.floor(this.difficulty / 3),
                Math.ceil(dynamicEnemyCap / 10)
            );

            // Limit wave size based on difficulty
            const actualWaveSize = Math.min(waveSize, Math.floor(this.difficulty / 2));

            for (let i = 0; i < actualWaveSize; i++) {
                this.scene.time.delayedCall(i * 200, () => {
                    if (this.scene.scene.isActive('MainScene')) {
                        this.spawnEnemy();
                    }
                });
            }
        }
    }

    // Select enemy type based on difficulty
    selectEnemyType() {
        const roll = Math.random();
        const difficultyLevel = Math.floor(this.difficulty);

        // Advanced enemies at higher difficulties
        if (difficultyLevel >= 10) {
            // High difficulty - include all enemy types
            if (roll < 0.05) return 'elite'; // Very rare
            if (roll < 0.10) return 'teleporter'; // Rare
            if (roll < 0.20) return 'bomber'; // Uncommon
            if (roll < 0.30) return 'tank'; // Common
            if (roll < 0.60) return 'fast'; // Common
            return 'basic'; // Most common
        }
        else if (difficultyLevel >= 7) {
            // Medium-high difficulty - introduce teleporter and bomber
            if (roll < 0.05) return 'teleporter';
            if (roll < 0.15) return 'bomber';
            if (roll < 0.30) return 'tank';
            if (roll < 0.60) return 'fast';
            return 'basic';
        }
        else if (difficultyLevel >= 5) {
            // Medium difficulty - introduce bomber
            if (roll < 0.10) return 'bomber';
            if (roll < 0.25) return 'tank';
            if (roll < 0.50) return 'fast';
            return 'basic';
        }
        else if (difficultyLevel >= 3) {
            // Low-medium difficulty - basic, fast and tanks
            if (roll < 0.15) return 'tank';
            if (roll < 0.40) return 'fast';
            return 'basic';
        }
        else if (difficultyLevel >= 2) {
            // Low difficulty - mostly basic with some fast
            if (roll < 0.30) return 'fast';
            return 'basic';
        }
        else {
            // Very low difficulty - just basic enemies
            return 'basic';
        }
    }

    increaseDifficulty() {
        this.difficulty += 0.5;

        // Show difficulty increase notification
        this.scene.showToastMessage(`Difficulty increased to ${Math.floor(this.difficulty)}!`);

        // Make enemies spawn faster but respect the minimum value
        this.spawnRate *= GAME_SETTINGS.difficultyScaling;
        this.spawnRate = Math.max(this.spawnRate, GAME_SETTINGS.minEnemySpawnRate);

        // Update spawn timer
        this.spawnTimer.reset({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Scale weapon damage to match difficulty
        if (this.scene.player && this.scene.player.weapons) {
            const damageMultiplier = Math.pow(GAME_SETTINGS.weaponDamageScaling,
                Math.floor(this.difficulty / 2) / 5);

            this.scene.player.weapons.forEach(weapon => {
                weapon.baseDamage = weapon.baseDamage || weapon.damage; // Store original base damage
                weapon.damage = Math.ceil(weapon.baseDamage * damageMultiplier);
            });
        }

        // Every few difficulty levels, add a "rest" period
        if (Math.floor(this.difficulty) % GAME_SETTINGS.restPeriodFrequency === 0) {
            this.startRestPeriod();
        }

        // Introduce new enemy types at specific difficulty milestones
        if (Math.floor(this.difficulty) === 5) {
            this.scene.showToastMessage("New enemy type: Bomber!", 3000);
        }
        if (Math.floor(this.difficulty) === 7) {
            this.scene.showToastMessage("New enemy type: Teleporter!", 3000);
        }
        if (Math.floor(this.difficulty) === 10) {
            this.scene.showToastMessage("New enemy type: Elite!", 3000);
        }
    }

    // Start a rest period
    startRestPeriod() {
        // Store original spawn rate
        const originalSpawnRate = this.spawnRate;

        // Greatly reduce enemy spawning
        this.spawnRate *= 5;
        this.spawnTimer.reset({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Rest period duration from settings
        const restDuration = GAME_SETTINGS.restPeriodDuration || 15000;

        // Show "Rest period" message with countdown
        const restText = this.scene.add.text(
            this.scene.game.config.width / 2,
            100,
            `REST PERIOD: ${Math.floor(restDuration / 1000)}s`,
            {
                fontSize: '32px',
                color: '#00ff00',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'Arial'
            }
        );
        restText.setOrigin(0.5);
        restText.setScrollFactor(0);
        restText.setDepth(100);

        // Add rest period health boost and effects
        if (this.scene.player) {
            // Heal player by 20%
            const healAmount = Math.ceil(this.scene.player.maxHealth * 0.2);
            this.scene.player.health = Math.min(
                this.scene.player.health + healAmount,
                this.scene.player.maxHealth
            );

            // Show healing effect
            const healText = this.scene.add.text(
                this.scene.player.sprite.x,
                this.scene.player.sprite.y - 30,
                `+${healAmount} HP`,
                {
                    fontSize: '20px',
                    color: '#00ff00',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            );
            healText.setOrigin(0.5);

            this.scene.tweens.add({
                targets: healText,
                y: healText.y - 40,
                alpha: 0,
                duration: 1000,
                onComplete: () => healText.destroy()
            });

            // Play heal sound
            playSound(this.scene, 'levelUp', { volume: 0.5 });

            // Add visual healing effect
            const healEffect = this.scene.add.circle(
                this.scene.player.sprite.x,
                this.scene.player.sprite.y,
                50, 0x00ff00, 0.3
            );

            this.scene.tweens.add({
                targets: healEffect,
                scale: 2,
                alpha: 0,
                duration: 1000,
                onComplete: () => healEffect.destroy()
            });
        }

        // Add countdown
        let timeLeft = restDuration / 1000;
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0 && restText && restText.active) {
                restText.setText(`REST PERIOD: ${timeLeft}s`);
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);

        // Reset back to normal spawn rate after rest period
        this.scene.time.delayedCall(restDuration, () => {
            if (!this.scene || !this.scene.scene || !this.scene.scene.isActive('MainScene')) {
                clearInterval(countdownInterval);
                return;
            }

            this.spawnRate = originalSpawnRate;
            this.spawnTimer.reset({
                delay: this.spawnRate,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });

            // Fade out rest text
            if (restText && restText.active) {
                this.scene.tweens.add({
                    targets: restText,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => restText.destroy()
                });
            }

            // Notify player that rest period is over
            this.scene.showToastMessage("Rest period over!", 2000);

            clearInterval(countdownInterval);
        });
    }

    // Clear all enemies from the screen (useful for transitions or boss fights)
    clearEnemies() {
        const enemies = this.enemies.getChildren();

        // Add visual effects for each enemy being cleared
        enemies.forEach(enemySprite => {
            const enemy = enemySprite.getData('ref');
            if (enemy) {
                // Visual effect
                this.scene.add.circle(
                    enemySprite.x,
                    enemySprite.y,
                    30,
                    0xffffff,
                    0.7
                ).setDepth(20);

                // Sometimes drop XP when cleared
                if (Math.random() < 0.3) {
                    enemy.dropXP();
                }

                enemy.destroy();
            }
        });

        return enemies.length; // Return how many enemies were cleared
    }

    // Pause or resume enemy spawning
    toggleSpawning(enable) {
        if (this.spawnTimer) {
            this.spawnTimer.paused = !enable;
        }
    }
}