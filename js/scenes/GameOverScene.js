// js/scenes/GameOverScene.js
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.survivedTime = data.time || 0;
        this.level = data.level || 1;

        // Save high score with username
        saveHighScore(this.score, this.survivedTime, this.level);
    }

    create() {
        // Create background
        this.createBackground();

        // Game over text
        this.add.text(400, 150, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: 48,
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Username
        this.add.text(400, 220, GAME_STATE.username, {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Stats
        const minutes = Math.floor(this.survivedTime / 60);
        const seconds = this.survivedTime % 60;

        this.add.text(400, 280, [
            `SCORE: ${this.score}`,
            `TIME SURVIVED: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`,
            `LEVEL REACHED: ${this.level}`
        ], {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // High score
        if (this.score >= GAME_STATE.highScore) {
            this.add.text(400, 380, 'NEW HIGH SCORE!', {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }

        // Play again button
        const playAgainButton = this.add.rectangle(400, 480, 240, 60, 0x880000)
            .setInteractive({ useHandCursor: true });

        this.add.text(400, 480, 'PLAY AGAIN', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Menu button
        const menuButton = this.add.rectangle(400, 550, 240, 50, 0x222266)
            .setInteractive({ useHandCursor: true });

        this.add.text(400, 550, 'MAIN MENU', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Button events
        playAgainButton.on('pointerdown', () => {
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.5 });
            }
            this.scene.start('MainScene');
        });

        menuButton.on('pointerdown', () => {
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.5 });
            }
            this.scene.start('MenuScene');
        });

        // Hover effects
        [playAgainButton, menuButton].forEach(button => {
            button.on('pointerover', () => {
                button.fillColor = button.fillColor + 0x222222;
                button.scale = 1.05;
            });

            button.on('pointerout', () => {
                button.fillColor = button.fillColor - 0x222222;
                button.scale = 1;
            });
        });
    }

    createBackground() {
        // Similar background to MenuScene
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Create dark tiled background
        const bg = this.add.tileSprite(
            width / 2, height / 2,
            width, height,
            'bgPattern'
        );
        bg.setTint(0x110022);
        bg.setAlpha(0.8);

        // Animate background
        this.tweens.add({
            targets: bg,
            tilePositionX: { from: 0, to: 100 },
            tilePositionY: { from: 0, to: 100 },
            duration: 20000,
            repeat: -1,
            ease: 'Linear'
        });
    }
}