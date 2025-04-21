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
        // Background
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

        // Start Game Button
        const startButton = this.add.rectangle(
            this.cameras.main.width / 2,
            300,
            240,
            60,
            0x4444aa
        ).setInteractive({ useHandCursor: true });

        // Button border
        const startButtonBorder = this.add.rectangle(
            this.cameras.main.width / 2,
            300,
            240,
            60
        ).setStrokeStyle(2, 0x8888ff);

        // Button text
        const startText = this.add.text(
            this.cameras.main.width / 2,
            300,
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

        // High Score Display
        this.add.text(
            this.cameras.main.width / 2,
            400,
            'HIGH SCORE',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.width / 2,
            430,
            GAME_STATE.highScore.toString(),
            {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffff00',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Instructions
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            520,
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
    }

    createBackground() {
        // Create a dark background with pattern
        const bgPattern = this.add.tileSprite(
            0, 0,
            this.cameras.main.width * 2,
            this.cameras.main.height * 2,
            'bgPattern'
        );
        bgPattern.setOrigin(0.25, 0.25);
        bgPattern.setTint(0x222244);
        bgPattern.setAlpha(0.7);

        // Add subtle animation
        this.tweens.add({
            targets: bgPattern,
            tilePositionX: { from: 0, to: 100 },
            tilePositionY: { from: 0, to: 100 },
            ease: 'Linear',
            duration: 30000,
            repeat: -1
        });

        // Add glowing particles in background
        const particles = this.add.particles('xp');
        particles.setDepth(-1);

        particles.createEmitter({
            x: { min: 0, max: this.cameras.main.width },
            y: { min: 0, max: this.cameras.main.height },
            scale: { start: 0.5, end: 0.1 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 5000,
            speedY: { min: -10, max: 10 },
            speedX: { min: -10, max: 10 },
            frequency: 500,
            blendMode: 'ADD'
        });
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
}