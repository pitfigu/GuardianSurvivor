class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.survivedTime = data.time || 0;
        this.level = data.level || 1;
    }

    create() {
        // Game over text
        this.add.text(400, 150, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: 48,
            color: '#ff0000'
        }).setOrigin(0.5);

        // Stats
        const minutes = Math.floor(this.survivedTime / 60);
        const seconds = this.survivedTime % 60;

        this.add.text(400, 250, [
            `SCORE: ${this.score}`,
            `TIME SURVIVED: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`,
            `LEVEL REACHED: ${this.level}`
        ], {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // High score
        if (this.score >= GAME_STATE.highScore) {
            this.add.text(400, 350, 'NEW HIGH SCORE!', {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffff00'
            }).setOrigin(0.5);
        }

        // Play again button
        const playAgainButton = this.add.text(400, 450, 'PLAY AGAIN', {
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

        // Menu button
        const menuButton = this.add.text(400, 520, 'MAIN MENU', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            padding: { x: 15, y: 8 },
            backgroundColor: '#222266'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            });
    }
}