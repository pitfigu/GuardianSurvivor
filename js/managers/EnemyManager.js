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
        if (this.enemies.getChildren().length >= GAME_SETTINGS.maxActiveEnemies) {
            return; // Skip spawning if too many enemies
        }
        // Calculate random position outside screen
        const { width, height } = this.scene.sys.game.config;
        let x, y;

        if (Math.random() < 0.5) {
            // Spawn on left or right side
            x = Math.random() < 0.5 ? -50 : width + 50;
            y = Phaser.Math.Between(0, height);
        } else {
            // Spawn on top or bottom side
            x = Phaser.Math.Between(0, width);
            y = Math.random() < 0.5 ? -50 : height + 50;
        }

        // Choose enemy type based on difficulty
        let type = 'basic';
        const roll = Math.random();

        if (this.difficulty >= 3 && roll < 0.2) {
            type = 'tank';
        } else if (this.difficulty >= 2 && roll < 0.4) {
            type = 'fast';
        }

        // Create enemy and add to group
        const enemy = new Enemy(this.scene, x, y, type);
        this.enemies.add(enemy.sprite);

        // Spawn multiple enemies based on difficulty
        if (this.difficulty >= 2) {
            const extraSpawns = Math.min(Math.floor(this.difficulty / 2), 5);
            for (let i = 0; i < extraSpawns; i++) {
                setTimeout(() => {
                    if (this.scene.scene.isActive('MainScene')) {
                        this.spawnEnemy();
                    }
                }, i * 200);
            }
        }
    }

    increaseDifficulty() {
        this.difficulty += 0.5;

        // Make enemies spawn faster but respect the minimum value
        this.spawnRate *= GAME_SETTINGS.difficultyScaling;
        this.spawnRate = Math.max(this.spawnRate, GAME_SETTINGS.minEnemySpawnRate);

        this.spawnTimer.reset({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Every few difficulty levels, add a "rest" period by temporarily slowing spawns
        if (Math.floor(this.difficulty) % 5 === 0) {
            const originalSpawnRate = this.spawnRate;
            this.spawnRate *= 3; // Temporarily triple the spawn time
            this.spawnTimer.reset({
                delay: this.spawnRate,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });

            // Show "Rest period" message
            const restText = this.scene.add.text(
                this.scene.game.config.width / 2,
                100,
                'Rest Period!',
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

            // Add timer effect
            this.scene.tweens.add({
                targets: restText,
                scale: 1.2,
                alpha: 0,
                y: 80,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    restText.destroy();

                    // Reset back to normal spawn rate after 10 seconds
                    this.scene.time.delayedCall(10000, () => {
                        this.spawnRate = originalSpawnRate;
                        this.spawnTimer.reset({
                            delay: this.spawnRate,
                            callback: this.spawnEnemy,
                            callbackScope: this,
                            loop: true
                        });
                    });
                }
            });
        }
    }
}