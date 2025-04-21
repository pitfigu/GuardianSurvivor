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
        // Health bar background
        this.healthBarBg = this.scene.add.rectangle(20, 20, 210, 25, 0x000000);
        this.healthBarBg.setOrigin(0, 0);
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setDepth(10);

        // Health bar fill
        this.healthBar = this.scene.add.rectangle(25, 25, 200, 15, 0xff0000);
        this.healthBar.setOrigin(0, 0);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(11);

        // Health text
        this.healthText = this.scene.add.text(125, 25, '', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.healthText.setOrigin(0.5, 0);
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(12);
    }

    createXPBar() {
        // XP bar background
        this.xpBarBg = this.scene.add.rectangle(20, 55, 210, 15, 0x000000);
        this.xpBarBg.setOrigin(0, 0);
        this.xpBarBg.setScrollFactor(0);
        this.xpBarBg.setDepth(10);

        // XP bar fill
        this.xpBar = this.scene.add.rectangle(25, 58, 200, 9, 0x00ffff);
        this.xpBar.setOrigin(0, 0);
        this.xpBar.setScrollFactor(0);
        this.xpBar.setDepth(11);

        // XP text
        this.xpText = this.scene.add.text(125, 58, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.xpText.setOrigin(0.5, 0);
        this.xpText.setScrollFactor(0);
        this.xpText.setDepth(12);
    }

    createScoreText() {
        const { width } = this.scene.sys.game.config;

        this.scoreText = this.scene.add.text(width - 20, 20, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.scoreText.setOrigin(1, 0);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(10);
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
        this.healthText.setText(`${this.scene.player.health} / ${this.scene.player.maxHealth}`);

        // Update XP bar
        const xpPercent = this.scene.currentXP / this.scene.xpToNextLevel;
        this.xpBar.width = 200 * xpPercent;
        this.xpText.setText(`XP: ${this.scene.currentXP} / ${this.scene.xpToNextLevel}`);

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