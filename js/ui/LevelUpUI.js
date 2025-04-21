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
        this.overlay.setVisible(true);
        this.title.setVisible(true);
        this.subtitle.setVisible(true);

        // Setup upgrade options
        for (let i = 0; i < upgrades.length && i < 3; i++) {
            const button = this.upgradeButtons[i];
            const upgrade = upgrades[i];

            button.upgrade = upgrade;
            button.nameText.setText(upgrade.name);
            button.descText.setText(upgrade.description);

            button.button.setVisible(true);
            button.nameText.setVisible(true);
            button.descText.setVisible(true);

            // Set up click handler
            button.button.off('pointerdown'); // Clear previous handler
            button.button.on('pointerdown', () => {
                this.selectUpgrade(button.upgrade);
            });
        }
    }

    hide() {
        this.visible = false;
        this.overlay.setVisible(false);
        this.title.setVisible(false);
        this.subtitle.setVisible(false);

        this.upgradeButtons.forEach(button => {
            button.button.setVisible(false);
            button.nameText.setVisible(false);
            button.descText.setVisible(false);
        });
    }

    selectUpgrade(upgrade) {
        // Apply the selected upgrade
        this.scene.applyUpgrade(upgrade);

        // Hide the UI
        this.hide();
    }
}