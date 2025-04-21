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

        // Make enemies spawn faster
        this.spawnRate *= GAME_SETTINGS.difficultyScaling;
        this.spawnTimer.reset({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }
}