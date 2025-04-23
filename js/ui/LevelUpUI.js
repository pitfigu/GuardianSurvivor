// js/ui/LevelUpUI.js
class LevelUpUI {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;

        // Create UI container
        this.createUI();
    }

    createUI() {
        const { width, height } = this.scene.sys.game.config;

        // Background overlay
        this.overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        this.overlay.setOrigin(0, 0);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(100);
        this.overlay.setVisible(false);

        // Level up title
        this.title = this.scene.add.text(width / 2, 120, 'LEVEL UP!', {
            fontSize: '36px',
            color: '#ffff00',
            fontFamily: 'Arial'
        });
        this.title.setOrigin(0.5);
        this.title.setScrollFactor(0);
        this.title.setDepth(101);
        this.title.setVisible(false);

        // Choose upgrade text
        this.subtitle = this.scene.add.text(width / 2, 170, 'Choose an upgrade:', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.subtitle.setOrigin(0.5);
        this.subtitle.setScrollFactor(0);
        this.subtitle.setDepth(101);
        this.subtitle.setVisible(false);

        // Upgrade options
        this.upgradeButtons = [];

        for (let i = 0; i < 3; i++) {
            const y = 250 + (i * 100);

            const button = this.scene.add.rectangle(width / 2, y, 400, 80, 0x333333);
            button.setOrigin(0.5);
            button.setScrollFactor(0);
            button.setDepth(101);
            button.setVisible(false);
            button.setInteractive({ useHandCursor: true });

            const nameText = this.scene.add.text(width / 2, y - 15, '', {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial'
            });
            nameText.setOrigin(0.5);
            nameText.setScrollFactor(0);
            nameText.setDepth(102);
            nameText.setVisible(false);

            const descText = this.scene.add.text(width / 2, y + 15, '', {
                fontSize: '14px',
                color: '#aaaaaa',
                fontFamily: 'Arial'
            });
            descText.setOrigin(0.5);
            descText.setScrollFactor(0);
            descText.setDepth(102);
            descText.setVisible(false);

            this.upgradeButtons.push({
                button,
                nameText,
                descText,
                upgrade: null
            });
        }
    }

    show(upgrades) {
        this.visible = true;

        // Add dramatic pause and effect when leveling up
        this.scene.time.delayedCall(300, () => {
            // Fade in overlay with a flash
            this.overlay.setVisible(true);
            this.overlay.setAlpha(0);
            this.scene.tweens.add({
                targets: this.overlay,
                alpha: 0.7,
                duration: 500
            });

            // Show level up title with animation
            this.title.setVisible(true);
            this.title.setScale(0.5);
            this.title.setAlpha(0);
            this.scene.tweens.add({
                targets: this.title,
                scale: 1,
                alpha: 1,
                duration: 600,
                ease: 'Back.easeOut'
            });

            // Show subtitle with animation
            this.subtitle.setVisible(true);
            this.subtitle.setAlpha(0);
            this.scene.tweens.add({
                targets: this.subtitle,
                alpha: 1,
                duration: 600,
                delay: 300
            });

            // Setup upgrade options with improved animations
            for (let i = 0; i < upgrades.length && i < 3; i++) {
                const button = this.upgradeButtons[i];
                const upgrade = upgrades[i];

                button.upgrade = upgrade;
                button.nameText.setText(upgrade.name);
                button.descText.setText(upgrade.description);

                // Set colors and styling based on upgrade type
                let bgColor = 0x333333;
                let borderColor = 0x666666;
                let iconKey = 'player';

                if (upgrade.type === 'weapon') {
                    bgColor = 0x224477;
                    borderColor = 0x4488ff;
                    iconKey = 'projectile';
                } else if (upgrade.type === 'weaponUpgrade') {
                    bgColor = 0x772244;
                    borderColor = 0xff88aa;
                    iconKey = 'projectile';
                } else if (upgrade.type === 'player') {
                    bgColor = 0x227744;
                    borderColor = 0x88ffaa;
                    iconKey = 'player';
                }

                button.button.fillColor = bgColor;
                button.button.setStrokeStyle(2, borderColor);

                // Add icon
                if (button.icon) button.icon.destroy();
                button.icon = this.scene.add.sprite(
                    this.scene.game.config.width / 2 - 160,
                    button.button.y,
                    iconKey
                );
                button.icon.setScale(0.8);
                button.icon.setVisible(true);
                button.icon.setDepth(102);

                // Make components visible
                button.button.setVisible(true);
                button.nameText.setVisible(true);
                button.descText.setVisible(true);

                // Animate entrance
                const elements = [button.button, button.nameText, button.descText, button.icon];
                elements.forEach(el => {
                    el.setAlpha(0);
                    el.x = this.scene.game.config.width + 200;
                });

                this.scene.tweens.add({
                    targets: elements,
                    x: {
                        getEnd: (target) => {
                            if (target === button.icon) {
                                return this.scene.game.config.width / 2 - 160;
                            } else if (target === button.nameText || target === button.descText) {
                                return this.scene.game.config.width / 2;
                            } else {
                                return this.scene.game.config.width / 2;
                            }
                        }
                    },
                    alpha: 1,
                    ease: 'Back.easeOut',
                    duration: 600,
                    delay: 500 + i * 150
                });

                // Add hover effect
                button.button.on('pointerover', () => {
                    button.button.setScale(1.05);
                    button.nameText.setScale(1.05);
                    button.icon.setScale(0.9);
                    this.scene.tweens.add({
                        targets: button.button,
                        fillColor: borderColor,
                        ease: 'Sine.easeOut',
                        duration: 200
                    });
                });

                button.button.on('pointerout', () => {
                    button.button.setScale(1);
                    button.nameText.setScale(1);
                    button.icon.setScale(0.8);
                    this.scene.tweens.add({
                        targets: button.button,
                        fillColor: bgColor,
                        ease: 'Sine.easeOut',
                        duration: 200
                    });
                });

                // Set up click handler with feedback
                button.button.off('pointerdown');
                button.button.on('pointerdown', () => {
                    // Play selection sound
                    if (this.scene.sound && this.scene.cache.audio.exists('select')) {
                        this.scene.sound.play('select', { volume: 0.5 });
                    }

                    // Button press effect
                    this.scene.tweens.add({
                        targets: [button.button, button.nameText, button.descText, button.icon],
                        scale: 0.95,
                        duration: 100,
                        yoyo: true,
                        onComplete: () => {
                            this.selectUpgrade(button.upgrade);
                        }
                    });
                });
            }
        });
    }

    hide(callback = null) {
        if (!this.visible) {
            if (callback) callback();
            return;
        }

        // Animate elements away
        const elements = [this.title, this.subtitle];
        this.upgradeButtons.forEach(button => {
            if (button.button.visible) {
                elements.push(button.button, button.nameText, button.descText);
                if (button.icon) elements.push(button.icon);
            }
        });

        this.scene.tweens.add({
            targets: elements,
            alpha: 0,
            y: '+=20',
            duration: 300,
            onComplete: () => {
                // Hide all UI elements
                this.overlay.setVisible(false);
                this.title.setVisible(false);
                this.subtitle.setVisible(false);

                this.upgradeButtons.forEach(button => {
                    button.button.setVisible(false);
                    button.nameText.setVisible(false);
                    button.descText.setVisible(false);
                    if (button.icon) button.icon.setVisible(false);
                });

                this.visible = false;

                // Call the callback after UI is hidden
                if (callback) callback();
            }
        });
    }

    selectUpgrade(upgrade) {
        // Apply the selected upgrade
        this.scene.applyUpgrade(upgrade);

        // Hide the UI
        this.hide();
    }
}