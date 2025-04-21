class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load minimal assets
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('xp', 'assets/xp.png');
        this.load.image('projectile', 'assets/projectile.png');
        this.createBasicSprites();
        // Load sound effects
        this.load.audio('hit', 'assets/hit.mp3');
        this.load.audio('levelUp', 'assets/levelUp.mp3');
        this.load.audio('pickup', 'assets/pickup.mp3');
        this.load.audio('shoot', 'assets/shoot.mp3');
        this.load.audio('enemyDeath', 'assets/enemyDeath.mp3');
        this.load.audio('playerHurt', 'assets/playerHurt.mp3');
        this.load.audio('select', 'assets/select.mp3');
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
        // Player sprite (blue guardian with glow)
        const playerGraphics = this.make.graphics({});
        playerGraphics.fillStyle(0x4488ff, 1);
        playerGraphics.fillCircle(16, 16, 14);
        playerGraphics.lineStyle(2, 0x88ccff);
        playerGraphics.strokeCircle(16, 16, 16);
        playerGraphics.fillStyle(0xaaddff, 0.5);
        playerGraphics.fillCircle(16, 16, 20);
        playerGraphics.generateTexture('player', 48, 48);

        // Enemy sprites - three different types with distinct looks

        // Basic enemy (red triangle with details)
        const enemyGraphics = this.make.graphics({});
        enemyGraphics.fillStyle(0xff4444, 1);
        enemyGraphics.fillTriangle(16, 2, 30, 30, 2, 30);
        enemyGraphics.fillStyle(0xff8888, 0.7);
        enemyGraphics.fillCircle(16, 20, 6);
        enemyGraphics.generateTexture('enemy', 32, 32);

        // Fast enemy (cyan diamond)
        const fastEnemyGraphics = this.make.graphics({});
        fastEnemyGraphics.fillStyle(0x00cccc, 1);
        fastEnemyGraphics.fillTriangle(16, 2, 30, 16, 16, 30);
        fastEnemyGraphics.fillTriangle(16, 2, 2, 16, 16, 30);
        fastEnemyGraphics.lineStyle(1, 0x00ffff);
        fastEnemyGraphics.strokeTriangle(16, 4, 28, 16, 16, 28);
        fastEnemyGraphics.strokeTriangle(16, 4, 4, 16, 16, 28);
        fastEnemyGraphics.generateTexture('fastEnemy', 32, 32);

        // Tank enemy (large red hexagon)
        const tankEnemyGraphics = this.make.graphics({});
        tankEnemyGraphics.fillStyle(0xdd0000, 1);
        tankEnemyGraphics.fillCircle(16, 16, 14);
        tankEnemyGraphics.lineStyle(3, 0xff0000);
        tankEnemyGraphics.strokeCircle(16, 16, 16);
        tankEnemyGraphics.fillStyle(0xff0000, 0.4);
        tankEnemyGraphics.fillCircle(16, 16, 20);
        tankEnemyGraphics.generateTexture('tankEnemy', 40, 40);

        // XP gem sprite (glowing green crystal)
        const xpGraphics = this.make.graphics({});
        xpGraphics.fillStyle(0x00ff00, 0.7);
        xpGraphics.fillCircle(8, 8, 6);
        xpGraphics.lineStyle(1, 0xaaffaa);
        xpGraphics.strokeCircle(8, 8, 8);
        xpGraphics.lineStyle(1, 0xffffff);
        xpGraphics.lineBetween(8, 2, 8, 14);
        xpGraphics.lineBetween(2, 8, 14, 8);
        xpGraphics.generateTexture('xp', 16, 16);

        // Projectile sprites - different for each weapon

        // Basic projectile (energy bolt)
        const projectileGraphics = this.make.graphics({});
        projectileGraphics.fillStyle(0xffff00, 1);
        projectileGraphics.fillRect(0, 2, 12, 4);
        projectileGraphics.fillStyle(0xffffff, 0.8);
        projectileGraphics.fillRect(0, 3, 12, 2);
        projectileGraphics.generateTexture('projectile', 12, 8);

        // Area weapon effect
        const areaGraphics = this.make.graphics({});
        areaGraphics.fillStyle(0x88aaff, 0.5);
        areaGraphics.fillCircle(50, 50, 50);
        areaGraphics.lineStyle(2, 0xaaccff, 1);
        areaGraphics.strokeCircle(50, 50, 50);
        areaGraphics.generateTexture('areaEffect', 100, 100);

        // Multi projectile
        const multiProjectileGraphics = this.make.graphics({});
        multiProjectileGraphics.fillStyle(0xff00ff, 1);
        multiProjectileGraphics.fillRect(0, 0, 8, 3);
        multiProjectileGraphics.fillStyle(0xffaaff, 0.8);
        multiProjectileGraphics.fillRect(0, 1, 8, 1);
        multiProjectileGraphics.generateTexture('multiProjectile', 8, 3);

        // Create background pattern
        const bgPatternGraphics = this.make.graphics({});
        bgPatternGraphics.fillStyle(0x222266, 1);
        bgPatternGraphics.fillRect(0, 0, 64, 64);
        bgPatternGraphics.lineStyle(1, 0x333377);
        bgPatternGraphics.strokeRect(0, 0, 64, 64);
        bgPatternGraphics.strokeRect(16, 16, 32, 32);
        bgPatternGraphics.generateTexture('bgPattern', 64, 64);
    }
}