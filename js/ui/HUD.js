// js/ui/HUD.js
class HUD {
    constructor(scene) {
        this.scene = scene;

        // Create UI elements
        this.createHealthBar();
        this.createXPBar();
        this.createScoreText();
        this.createTimeText();
        this.createLevelText();
    }

    createHealthBar() {
        // Health bar container with beveled style
        this.healthBarBg = this.scene.add.rectangle(20, 20, 210, 30, 0x000000, 0.7);
        this.healthBarBg.setOrigin(0, 0);
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setStrokeStyle(2, 0x3333aa);
        this.healthBarBg.setDepth(10);

        // Health bar fill with gradient effect
        this.healthBar = this.scene.add.rectangle(25, 25, 200, 20, 0xff0000);
        this.healthBar.setOrigin(0, 0);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(11);

        // Health bar shine
        this.healthBarShine = this.scene.add.rectangle(25, 25, 200, 10, 0xff5555);
        this.healthBarShine.setOrigin(0, 0);
        this.healthBarShine.setScrollFactor(0);
        this.healthBarShine.setDepth(11);

        // Health icon
        const healthIcon = this.scene.add.circle(15, 35, 8, 0xff0000);
        healthIcon.setScrollFactor(0);
        healthIcon.setDepth(11);
        this.scene.add.circle(15, 35, 4, 0xffffff, 0.7).setScrollFactor(0).setDepth(11);

        // Health text
        this.healthText = this.scene.add.text(130, 22, '', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.healthText.setOrigin(0.5, 0);
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(12);
    }

    createXPBar() {
        // XP bar background with beveled style
        this.xpBarBg = this.scene.add.rectangle(20, 60, 210, 18, 0x000000, 0.7);
        this.xpBarBg.setOrigin(0, 0);
        this.xpBarBg.setScrollFactor(0);
        this.xpBarBg.setStrokeStyle(2, 0x3333aa);
        this.xpBarBg.setDepth(10);

        // XP bar fill with gradient effect
        this.xpBar = this.scene.add.rectangle(25, 63, 200, 12, 0x00ffff);
        this.xpBar.setOrigin(0, 0);
        this.xpBar.setScrollFactor(0);
        this.xpBar.setDepth(11);

        // XP bar shine
        this.xpBarShine = this.scene.add.rectangle(25, 63, 200, 6, 0x99ffff);
        this.xpBarShine.setOrigin(0, 0);
        this.xpBarShine.setScrollFactor(0);
        this.xpBarShine.setDepth(11);

        // XP icon
        const xpIcon = this.scene.add.star(15, 69, 5, 4, 8, 0x00ffff);
        xpIcon.setScrollFactor(0);
        xpIcon.setDepth(11);

        // XP text
        this.xpText = this.scene.add.text(130, 61, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.xpText.setOrigin(0.5, 0);
        this.xpText.setScrollFactor(0);
        this.xpText.setDepth(12);

        // XP pulsating when near level up
        this.scene.tweens.add({
            targets: this.xpBarShine,
            alpha: { from: 0.7, to: 1.0 },
            yoyo: true,
            repeat: -1,
            duration: 500
        });
    }

    createScoreText() {
        const { width } = this.scene.sys.game.config;

        // Score container
        this.scoreContainer = this.scene.add.rectangle(
            width - 120, 25, 200, 40, 0x000000, 0.6
        );
        this.scoreContainer.setScrollFactor(0);
        this.scoreContainer.setDepth(10);
        this.scoreContainer.setStrokeStyle(1, 0x3333aa);

        // Score text
        this.scoreText = this.scene.add.text(width - 20, 20, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.scoreText.setOrigin(1, 0);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(11);
    }

    createTimeText() {
        const { width } = this.scene.sys.game.config;

        this.timeText = this.scene.add.text(width - 20, 50, 'Time: 0:00', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.timeText.setOrigin(1, 0);
        this.timeText.setScrollFactor(0);
        this.timeText.setDepth(10);
    }

    createLevelText() {
        const { width } = this.scene.sys.game.config;

        this.levelText = this.scene.add.text(width / 2, 20, 'Level: 1', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.levelText.setOrigin(0.5, 0);
        this.levelText.setScrollFactor(0);
        this.levelText.setDepth(10);
    }

    update() {
        // Update health bar
        const healthPercent = this.scene.player.health / this.scene.player.maxHealth;
        this.healthBar.width = 200 * healthPercent;
        this.healthBarShine.width = 200 * healthPercent;
        this.healthText.setText(`${this.scene.player.health} / ${this.scene.player.maxHealth}`);

        // Update XP bar
        const xpPercent = this.scene.currentXP / this.scene.xpToNextLevel;
        this.xpBar.width = 200 * xpPercent;
        this.xpBarShine.width = 200 * xpPercent;
        this.xpText.setText(`XP: ${this.scene.currentXP} / ${this.scene.xpToNextLevel}`);

        // Add pulsating effect as player nears level-up
        if (xpPercent > 0.9) {
            this.xpBarShine.fillColor = 0xffffff;
            this.xpText.setColor('#ffff00');
        } else {
            this.xpBarShine.fillColor = 0x99ffff;
            this.xpText.setColor('#ffffff');
        }

        // Update score
        this.scoreText.setText(`Score: ${this.scene.score}`);

        // Update time
        const minutes = Math.floor(this.scene.gameTime / 60);
        const seconds = this.scene.gameTime % 60;
        this.timeText.setText(`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

        // Update level
        this.levelText.setText(`Level: ${this.scene.playerLevel}`);
    }
}