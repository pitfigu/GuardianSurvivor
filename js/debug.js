// js/debug.js
class GameDebugger {
    constructor(scene) {
        this.scene = scene;
        this.isEnabled = true;
        this.debugInfo = {};
    }

    // Call this in MainScene create()
    initialize() {
        if (!this.isEnabled) return;

        // Create background for debug panel
        this.debugPanel = this.scene.add.rectangle(
            10, 10, 300, 400, 0x000000, 0.7
        );
        this.debugPanel.setOrigin(0, 0);
        this.debugPanel.setScrollFactor(0);
        this.debugPanel.setDepth(1000);

        // Create debug text
        this.debugText = this.scene.add.text(
            20, 20, 'Debug Info', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff'
        }
        );
        this.debugText.setScrollFactor(0);
        this.debugText.setDepth(1001);

        // Add toggle key (F3)
        this.scene.input.keyboard.on('keydown-F3', () => {
            this.isEnabled = !this.isEnabled;
            this.debugPanel.setVisible(this.isEnabled);
            this.debugText.setVisible(this.isEnabled);
        });

        // Initial logs
        this.logBasicInfo();
    }

    update() {
        if (!this.isEnabled) return;

        // Update player position info
        if (this.scene.player && this.scene.player.sprite) {
            this.debugInfo.playerX = Math.floor(this.scene.player.sprite.x);
            this.debugInfo.playerY = Math.floor(this.scene.player.sprite.y);
            this.debugInfo.playerVisible = this.scene.player.sprite.visible;
            this.debugInfo.playerActive = this.scene.player.sprite.active;
            this.debugInfo.playerAlpha = this.scene.player.sprite.alpha;
            this.debugInfo.playerDepth = this.scene.player.sprite.depth;
            this.debugInfo.cameraX = Math.floor(this.scene.cameras.main.scrollX);
            this.debugInfo.cameraY = Math.floor(this.scene.cameras.main.scrollY);
        }

        // Update display
        let debugText = 'DEBUG INFO:\n\n';
        for (const [key, value] of Object.entries(this.debugInfo)) {
            debugText += `${key}: ${value}\n`;
        }
        this.debugText.setText(debugText);
    }

    logBasicInfo() {
        // Log game config
        this.debugInfo.gameWidth = this.scene.game.config.width;
        this.debugInfo.gameHeight = this.scene.game.config.height;
        this.debugInfo.renderer = this.scene.game.config.renderType === 1 ? 'WebGL' : 'Canvas';

        // Log available textures
        const textureKeys = this.scene.textures.getTextureKeys();
        this.debugInfo.textures = textureKeys.join(', ');

        // Log audio status
        this.debugInfo.audioEnabled = this.scene.sound.context.state;

        // Log physics info
        this.debugInfo.physicsSystem = this.scene.physics.config.default;
    }

    // Helper to draw circle at player position for debugging
    highlightPlayer() {
        if (!this.scene.player || !this.scene.player.sprite) return;

        // Create a bright highlight around the player
        const highlight = this.scene.add.circle(
            this.scene.player.sprite.x,
            this.scene.player.sprite.y,
            40, 0xff0000, 0.5
        );

        // Animate the highlight
        this.scene.tweens.add({
            targets: highlight,
            alpha: 0,
            scale: 2,
            duration: 1000,
            repeat: 5,
            onComplete: () => highlight.destroy()
        });

        // Also add a fixed position marker at the center of the screen
        const centerMarker = this.scene.add.circle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            10, 0x00ff00, 0.8
        );
        centerMarker.setScrollFactor(0);
        centerMarker.setDepth(1000);

        // Destroy after 5 seconds
        this.scene.time.delayedCall(5000, () => {
            centerMarker.destroy();
        });
    }
}