class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.createBasicSprites();
        // Load sound effects
        this.load.audio('hit', 'assets/hit.mp3');
        this.load.audio('levelUp', 'assets/levelUp.wav');
        this.load.audio('pickup', 'assets/pickup.wav');
        this.load.audio('shoot', 'assets/shoot.wav');
        this.load.audio('enemyDeath', 'assets/enemyDeath.wav');
        this.load.audio('playerHurt', 'assets/playerHurt.mp3');
        this.load.audio('select', 'assets/select.wav');
    }

    create() {
        // Title
        const title = this.add.text(400, 150, 'VAMPIRE SURVIVORS CLONE', {
            fontFamily: 'Arial',
            fontSize: 36,
            color: '#ffffff'
        }).setOrigin(0.5);

        // Start Game Button
        const startButton = this.add.text(400, 300, 'START GAME', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            padding: { x: 20, y: 10 },
            backgroundColor: '#880000'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MainScene');
            });

        // High Score
        const highScoreText = this.add.text(400, 400, `HIGH SCORE: ${GAME_STATE.highScore}`, {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff'
        }).setOrigin(0.5);

        // Instructions
        const instructions = this.add.text(400, 500, 'Move: WASD or Arrow Keys\nSurvive as long as possible!', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }

    createBasicSprites() {
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