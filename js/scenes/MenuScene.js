// js/scenes/MenuScene.js
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Create basic sprites using graphics
        this.createBasicSprites();

        // Load sound effects - using .wav format
        this.load.audio('hit', 'assets/hit.mp3');
        this.load.audio('levelUp', 'assets/levelUp.wav');
        this.load.audio('pickup', 'assets/pickup.wav');
        this.load.audio('shoot', 'assets/shoot.wav');
        this.load.audio('enemyDeath', 'assets/enemyDeath.wav');
        this.load.audio('playerHurt', 'assets/playerHurt.mp3');
        this.load.audio('select', 'assets/select.wav');

        // Add a loading text
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Loading...',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        loadingText.setOrigin(0.5);
    }

    create() {
        // Create background
        this.createBackground();

        // Title with glow effect
        const title = this.add.text(
            this.cameras.main.width / 2,
            120,
            'GUARDIAN SURVIVOR',
            {
                fontFamily: 'Arial',
                fontSize: 48,
                color: '#88bbff',
                fontStyle: 'bold',
                stroke: '#000066',
                strokeThickness: 6,
                shadow: { color: '#0088ff', fill: true, offsetX: 0, offsetY: 0, blur: 10 }
            }
        ).setOrigin(0.5);

        // Add a subtle animation to the title
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Username section
        this.add.text(
            this.cameras.main.width / 2,
            210,
            'ENTER YOUR NAME:',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Get existing username from local storage or use default
        const savedUsername = localStorage.getItem('username') || 'Player';

        // Create DOM element for username input
        const element = this.add.dom(
            this.cameras.main.width / 2,
            250
        ).createFromHTML(`
            <div style="background-color: #222266; padding: 10px; border-radius: 5px; border: 2px solid #4444aa;">
                <input type="text" id="username" name="username" 
                    placeholder="Enter your name" 
                    value="${savedUsername}"
                    style="padding: 8px; font-size: 16px; border-radius: 4px; border: none; width: 200px; text-align: center;">
            </div>
        `);

        // Start Game Button
        const startButton = this.add.rectangle(
            this.cameras.main.width / 2,
            350,
            240,
            60,
            0x4444aa
        ).setInteractive({ useHandCursor: true });

        // Button border
        const startButtonBorder = this.add.rectangle(
            this.cameras.main.width / 2,
            350,
            240,
            60
        ).setStrokeStyle(2, 0x8888ff);

        // Button text
        const startText = this.add.text(
            this.cameras.main.width / 2,
            350,
            'START GAME',
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Button hover effect
        startButton.on('pointerover', () => {
            startButton.fillColor = 0x6666cc;
            startButton.scale = 1.05;
            startText.scale = 1.05;
        });

        startButton.on('pointerout', () => {
            startButton.fillColor = 0x4444aa;
            startButton.scale = 1;
            startText.scale = 1;
        });

        // Button click action
        startButton.on('pointerdown', () => {
            // Play selection sound if available
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.5 });
            }

            // Save username
            const inputElement = document.getElementById('username');
            if (inputElement) {
                const username = inputElement.value || 'Player';
                localStorage.setItem('username', username);
                GAME_STATE.username = username;
            }

            // Button press effect
            this.tweens.add({
                targets: [startButton, startText, startButtonBorder],
                scale: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.cameras.main.fade(500, 0, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.scene.start('MainScene');
                    });
                }
            });
        });

        // Leaderboard button
        const leaderboardButton = this.add.rectangle(
            this.cameras.main.width / 2,
            430,
            240,
            50,
            0x222288
        ).setInteractive({ useHandCursor: true });

        // Button border
        this.add.rectangle(
            this.cameras.main.width / 2,
            430,
            240,
            50
        ).setStrokeStyle(2, 0x6666cc);

        // Button text
        this.add.text(
            this.cameras.main.width / 2,
            430,
            'VIEW LEADERBOARD',
            {
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Button hover effect
        leaderboardButton.on('pointerover', () => {
            leaderboardButton.fillColor = 0x3333aa;
            leaderboardButton.scale = 1.05;
        });

        leaderboardButton.on('pointerout', () => {
            leaderboardButton.fillColor = 0x222288;
            leaderboardButton.scale = 1;
        });

        // Button click action
        leaderboardButton.on('pointerdown', () => {
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.5 });
            }
            this.showLeaderboard();
        });

        // High Score Display
        this.add.text(
            this.cameras.main.width / 2,
            500,
            'YOUR HIGH SCORE',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.width / 2,
            530,
            GAME_STATE.highScore.toString(),
            {
                fontFamily: 'Arial',
                fontSize: 28,
                color: '#ffff00',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Instructions
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            600,
            'Move: WASD or Arrow Keys\nAutomatically attack nearby enemies\nCollect XP to level up!',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#aaaaff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Credits
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 30,
            'Guardian Survivor - A Vampire Survivors-style game',
            {
                fontFamily: 'Arial',
                fontSize: 12,
                color: '#888888',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Fade in
        this.cameras.main.fadeIn(1000);
    }

    update() {
        // If you have a background that needs animation, update it here
        if (this.stars1) {
            this.stars1.tilePositionX += 0.2;
            this.stars1.tilePositionY += 0.1;
        }

        if (this.stars2) {
            this.stars2.tilePositionX += 0.1;
            this.stars2.tilePositionY += 0.2;
        }
    }

    createBackground() {
        // Calculate background size to ensure it covers the entire game area
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create starfield background
        const stars1 = this.add.tileSprite(
            width / 2,
            height / 2,
            width,
            height,
            'bgPattern'
        );
        stars1.setTint(0x222244);
        stars1.setDepth(-10);
        this.stars1 = stars1;

        // Second starfield layer for parallax effect
        const stars2 = this.add.tileSprite(
            width / 2,
            height / 2,
            width,
            height,
            'bgPattern'
        );
        stars2.setTint(0x3333aa);
        stars2.setScale(0.5);
        stars2.setDepth(-9);
        stars2.setAlpha(0.7);
        this.stars2 = stars2;

        // Add nebula effect
        const nebulaColors = [0x9955ff, 0x5599ff, 0xff5599];
        for (let i = 0; i < 3; i++) {
            const color = Phaser.Utils.Array.GetRandom(nebulaColors);
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(150, 350);

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

        // Add glowing particles in background
        try {
            const particles = this.add.particles(0, 0, 'xp');
            particles.setDepth(-7);

            particles.createEmitter({
                x: { min: 0, max: width },
                y: { min: 0, max: height },
                scale: { start: 0.5, end: 0.1 },
                alpha: { start: 0.5, end: 0 },
                lifespan: 5000,
                speedY: { min: -10, max: 10 },
                speedX: { min: -10, max: 10 },
                frequency: 500,
                blendMode: 'ADD'
            });
        } catch (e) {
            console.warn("Could not create background particles", e);
        }
    }

    createBasicSprites() {
        // Only create textures if they don't already exist
        if (!this.textures.exists('player')) {
            // Player sprite (blue guardian)
            const playerGraphics = this.make.graphics({});
            playerGraphics.fillStyle(0x4488ff, 1);
            playerGraphics.fillCircle(16, 16, 12);  // Main body
            playerGraphics.lineStyle(2, 0x88ccff);
            playerGraphics.strokeCircle(16, 16, 12); // Outline
            playerGraphics.generateTexture('player', 32, 32);

            // Basic enemy (red triangle)
            const enemyGraphics = this.make.graphics({});
            enemyGraphics.fillStyle(0xff4444, 1);
            enemyGraphics.fillTriangle(16, 5, 27, 27, 5, 27);
            enemyGraphics.generateTexture('enemy', 32, 32);

            // Fast enemy (cyan diamond)
            const fastEnemyGraphics = this.make.graphics({});
            fastEnemyGraphics.fillStyle(0x00ccff, 1);
            fastEnemyGraphics.fillTriangle(16, 5, 27, 16, 16, 27);
            fastEnemyGraphics.fillTriangle(16, 5, 5, 16, 16, 27);
            fastEnemyGraphics.generateTexture('fastEnemy', 32, 32);

            // Tank enemy (red hexagon)
            const tankEnemyGraphics = this.make.graphics({});
            tankEnemyGraphics.fillStyle(0xdd0000, 1);
            tankEnemyGraphics.fillCircle(16, 16, 14);
            tankEnemyGraphics.lineStyle(2, 0xff0000);
            tankEnemyGraphics.strokeCircle(16, 16, 14);
            tankEnemyGraphics.generateTexture('tankEnemy', 32, 32);

            // XP gem sprite (small green crystal)
            const xpGraphics = this.make.graphics({});
            xpGraphics.fillStyle(0x00ff66, 1);
            xpGraphics.fillRect(4, 4, 8, 8);     // Small square
            xpGraphics.lineStyle(1, 0x88ffaa);
            xpGraphics.strokeRect(4, 4, 8, 8);   // Outline
            xpGraphics.generateTexture('xp', 16, 16);

            // Basic projectile (energy bolt)
            const projectileGraphics = this.make.graphics({});
            projectileGraphics.fillStyle(0xffff00, 1);
            projectileGraphics.fillRect(0, 1, 8, 2);     // Small but visible
            projectileGraphics.generateTexture('projectile', 8, 4);

            // Area weapon effect
            const areaGraphics = this.make.graphics({});
            areaGraphics.fillStyle(0x88aaff, 0.3);  // More transparent
            areaGraphics.fillCircle(50, 50, 50);
            areaGraphics.lineStyle(1, 0xaaccff, 0.5);
            areaGraphics.strokeCircle(50, 50, 50);
            areaGraphics.generateTexture('areaEffect', 100, 100);

            // Multi projectile
            const multiProjectileGraphics = this.make.graphics({});
            multiProjectileGraphics.fillStyle(0xff00ff, 1);
            multiProjectileGraphics.fillRect(0, 0, 6, 2);  // Small but visible
            multiProjectileGraphics.generateTexture('multiProjectile', 6, 2);

            // Background pattern tile
            const bgPatternGraphics = this.make.graphics({});
            bgPatternGraphics.fillStyle(0x222266, 1);
            bgPatternGraphics.fillRect(0, 0, 64, 64);
            bgPatternGraphics.lineStyle(1, 0x333377);
            bgPatternGraphics.strokeRect(0, 0, 64, 64);
            bgPatternGraphics.generateTexture('bgPattern', 64, 64);
        }
    }

    showLeaderboard() {
        // Create leaderboard panel
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            500,
            500,
            0x222244,
            0.95
        );
        panel.setStrokeStyle(2, 0x4444aa);

        // Title
        const title = this.add.text(
            this.cameras.main.width / 2,
            panel.y - 220,
            'LEADERBOARD',
            {
                fontFamily: 'Arial',
                fontSize: 28,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Get high scores from localStorage
        const highScores = this.getHighScores();

        // Display high scores
        const scoreText = [];
        for (let i = 0; i < Math.min(highScores.length, 10); i++) {
            const score = highScores[i];
            const text = this.add.text(
                this.cameras.main.width / 2,
                panel.y - 160 + (i * 40),
                `${i + 1}. ${score.name} - ${score.score} - Lvl ${score.level}`,
                {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    color: i === 0 ? '#ffff00' : '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
            scoreText.push(text);
        }

        // If no scores, show message
        if (highScores.length === 0) {
            const noScores = this.add.text(
                this.cameras.main.width / 2,
                panel.y,
                'No scores yet. Play a game!',
                {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    color: '#aaaaaa',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
            scoreText.push(noScores);
        }

        // Close button
        const closeButton = this.add.rectangle(
            this.cameras.main.width / 2,
            panel.y + 220,
            200,
            50,
            0x444488
        ).setInteractive({ useHandCursor: true });

        const closeText = this.add.text(
            this.cameras.main.width / 2,
            panel.y + 220,
            'CLOSE',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        closeButton.on('pointerover', () => {
            closeButton.fillColor = 0x5555aa;
            closeButton.scale = 1.05;
            closeText.scale = 1.05;
        });

        closeButton.on('pointerout', () => {
            closeButton.fillColor = 0x444488;
            closeButton.scale = 1;
            closeText.scale = 1;
        });

        closeButton.on('pointerdown', () => {
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.3 });
            }

            // Fade out and destroy panel
            const elements = [panel, title, closeButton, closeText, ...scoreText];
            this.tweens.add({
                targets: elements,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    elements.forEach(el => el.destroy());
                }
            });
        });
    }

    getHighScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('highScores')) || [];
            return scores.sort((a, b) => b.score - a.score);
        } catch (e) {
            console.error("Error loading high scores:", e);
            return [];
        }
    }
}