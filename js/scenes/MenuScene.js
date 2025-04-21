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
}