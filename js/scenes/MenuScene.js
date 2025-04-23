// js/scenes/MenuScene.js
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Create basic sprites using graphics
        this.createBasicSprites();

        // Load sound effects - using .wav format
        this.load.audio('hit', 'assets/hit.mp3');
        this.load.audio('levelUp', 'assets/levelUp.wav');
        this.load.audio('pickup', 'assets/pickup.wav');
        this.load.audio('shoot', 'assets/shoot.wav');
        this.load.audio('enemyDeath', 'assets/enemyDeath.wav');
        this.load.audio('playerHurt', 'assets/playerHurt.mp3');
        this.load.audio('select', 'assets/select.wav');

        // Add a loading text
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Loading...',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        loadingText.setOrigin(0.5);
    }

    create() {
        // Create animated background
        this.createEnhancedBackground();

        // Game logo/title
        this.createGameTitle();

        // Player info section with username input
        this.createPlayerSection();

        // Main menu options
        this.createMenuOptions();

        // Game info and credits
        this.createInfoSection();

        // Fade in everything
        this.cameras.main.fadeIn(1000);
    }

    createEnhancedBackground() {
        // Create a starfield effect
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Gradient background
        const gradientTop = 0x110022;
        const gradientBottom = 0x330066;

        // Use rectangles to simulate gradient
        for (let i = 0; i < height; i += 4) {
            const ratio = i / height;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                { r: (gradientTop >> 16) & 0xFF, g: (gradientTop >> 8) & 0xFF, b: gradientTop & 0xFF },
                { r: (gradientBottom >> 16) & 0xFF, g: (gradientBottom >> 8) & 0xFF, b: gradientBottom & 0xFF },
                100,
                ratio * 100
            );

            const rgbColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

            const rect = this.add.rectangle(width / 2, i, width, 4, rgbColor);
            rect.setOrigin(0.5, 0);
            rect.setDepth(-15);
        }

        // Add floating stars
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8);

            const star = this.add.circle(x, y, size, 0xffffff, alpha);

            // Random twinkling animation
            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.1, 0.4),
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }

        // Add some nebulae for atmosphere
        const nebulaColors = [0x5522aa, 0x2244aa, 0x4400aa];
        for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const radius = Phaser.Math.Between(150, 300);

            const nebula = this.add.circle(x, y, radius, nebulaColors[i], 0.03);
            nebula.setDepth(-10);

            // Subtle pulsating effect
            this.tweens.add({
                targets: nebula,
                alpha: 0.06,
                scale: 1.1,
                duration: 5000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }

        // Add a subtle grid pattern
        const grid = this.add.grid(
            width / 2, height / 2,
            width * 2, height * 2,
            64, 64,
            undefined, 0,
            0x3333aa, 0.08
        );
        grid.setDepth(-5);
    }

    createGameTitle() {
        // Create fancy title with glow effect
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            100,
            'GUARDIAN SURVIVOR',
            {
                fontFamily: 'Arial Black, Arial Bold, Gadget, sans-serif',
                fontSize: 52,
                color: '#88bbff',
                align: 'center',
                stroke: '#000066',
                strokeThickness: 8,
                shadow: { color: '#0066ff', fill: true, offsetX: 0, offsetY: 0, blur: 15 }
            }
        ).setOrigin(0.5);

        // Add subtle animation to title
        this.tweens.add({
            targets: titleText,
            scale: { from: 1, to: 1.05 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add a particle effect behind the title
        try {
            const particles = this.add.particles(this.cameras.main.width / 2, 100, 'xp', {
                scale: { start: 0.5, end: 0.1 },
                speed: { min: 0, max: 20 },
                quantity: 1,
                frequency: 200,
                lifespan: 2000,
                alpha: { start: 0.5, end: 0 },
                blendMode: 'ADD',
                emitZone: {
                    source: new Phaser.Geom.Rectangle(-200, -20, 400, 40),
                    type: 'random'
                }
            });
        } catch (e) {
            console.warn("Particle effect creation failed:", e);
        }
    }

    createPlayerSection() {
        const y = 220;

        // Create panel background
        const panelBg = this.add.rectangle(
            this.cameras.main.width / 2, y,
            400, 120,
            0x222255, 0.7
        );
        panelBg.setStrokeStyle(2, 0x4444aa);

        // Username section title
        this.add.text(
            this.cameras.main.width / 2,
            y - 40,
            'ENTER YOUR NAME:',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Get existing username from local storage or use default
        const savedUsername = localStorage.getItem('username') || 'Player';

        // Create DOM element for username input
        const element = this.add.dom(
            this.cameras.main.width / 2,
            y
        ).createFromHTML(`
            <div style="background-color: #222266; padding: 10px; border-radius: 8px; border: 2px solid #4444aa;">
                <input type="text" id="username" name="username" 
                    placeholder="Enter your name" 
                    value="${savedUsername}"
                    maxlength="15"
                    style="padding: 12px; font-size: 20px; border-radius: 6px; border: none; width: 250px; text-align: center; background-color: #111133; color: #ffffff; outline: none;">
            </div>
        `);

        // Focus input on click
        element.addListener('click');
        element.on('click', (event) => {
            event.target.focus();
        });
    }

    createMenuOptions() {
        const baseY = 350;
        const spacing = 80;

        // Create start game button
        this.createMenuButton(baseY, 'START GAME', 0x4444aa, () => {
            this.startGame();
        });

        // Create leaderboard button
        this.createMenuButton(baseY + spacing, 'LEADERBOARD', 0x222288, () => {
            this.showLeaderboard();
        });

        // Create settings button
        this.createMenuButton(baseY + spacing * 2, 'SETTINGS', 0x225588, () => {
            this.showSettings();
        });
    }

    createMenuButton(y, text, color, callback) {
        // Button background with glow
        const button = this.add.rectangle(
            this.cameras.main.width / 2,
            y,
            280,
            60,
            color,
            0.9
        ).setInteractive({ useHandCursor: true });

        // Add stroke and shadow for depth
        button.setStrokeStyle(2, 0x8888ff);

        // Button text
        const buttonText = this.add.text(
            button.x,
            button.y,
            text,
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff',
                stroke: '#000033',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Button hover effect
        button.on('pointerover', () => {
            button.fillColor = 0x6666cc;
            button.scale = 1.05;
            buttonText.scale = 1.05;

            // Add particle burst on hover
            try {
                const particles = this.add.particles(button.x, button.y, 'xp', {
                    scale: { start: 0.2, end: 0 },
                    speed: { min: 20, max: 50 },
                    quantity: 10,
                    lifespan: 500,
                    alpha: { start: 0.5, end: 0 },
                    blendMode: 'ADD'
                });

                // Destroy after emitting
                this.time.delayedCall(100, () => particles.destroy());
            } catch (e) {
                console.warn("Particle effect failed:", e);
            }
        });

        button.on('pointerout', () => {
            button.fillColor = color;
            button.scale = 1;
            buttonText.scale = 1;
        });

        // Click effect
        button.on('pointerdown', () => {
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.5 });
            }

            this.tweens.add({
                targets: [button, buttonText],
                scale: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: callback
            });
        });

        return button;
    }

    createInfoSection() {
        const y = this.cameras.main.height - 80;

        // High score display
        this.add.text(
            this.cameras.main.width / 2,
            y - 40,
            'HIGH SCORE',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#aaaaff',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.width / 2,
            y - 10,
            GAME_STATE.highScore.toString(),
            {
                fontFamily: 'Arial',
                fontSize: 28,
                color: '#ffff00',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Instructions and credits
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 40,
            'Move: WASD/Arrows or Mouse  •  Collect XP  •  Survive!',
            {
                fontFamily: 'Arial',
                fontSize: 14,
                color: '#aaaaaa',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 20,
            '© 2023 Guardian Survivor',
            {
                fontFamily: 'Arial',
                fontSize: 12,
                color: '#666666',
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    startGame() {
        // Save username
        const inputElement = document.getElementById('username');
        if (inputElement) {
            const username = inputElement.value || 'Player';
            localStorage.setItem('username', username);
            GAME_STATE.username = username;
        }

        // Fade out and start game
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('MainScene');
        });
    }

    showSettings() {
        // Create settings menu
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            500,
            400,
            0x222244,
            0.95
        );
        panel.setStrokeStyle(2, 0x4444aa);

        // Title
        const title = this.add.text(
            this.cameras.main.width / 2,
            panel.y - 160,
            'SETTINGS',
            {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Sound settings
        const soundText = this.add.text(
            panel.x - 150,
            panel.y - 80,
            'SOUND VOLUME:',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff'
            }
        ).setOrigin(0, 0.5);

        // Get current sound volume
        const currentVolume = parseFloat(localStorage.getItem('gameVolume') || '0.5');

        // Create volume slider
        const sliderBg = this.add.rectangle(
            panel.x + 80,
            panel.y - 80,
            200,
            20,
            0x000000
        );
        sliderBg.setStrokeStyle(2, 0x4444aa);

        // Slider fill
        const sliderFill = this.add.rectangle(
            sliderBg.x - sliderBg.width / 2 + (sliderBg.width * currentVolume) / 2,
            sliderBg.y,
            sliderBg.width * currentVolume,
            sliderBg.height,
            0x4466cc
        );
        sliderFill.setOrigin(0.5);

        // Slider handle
        const handle = this.add.circle(
            sliderBg.x - sliderBg.width / 2 + (sliderBg.width * currentVolume),
            sliderBg.y,
            15,
            0x6688ff
        );
        handle.setInteractive({ draggable: true, useHandCursor: true });

        // Handle drag events
        handle.on('drag', (pointer, dragX) => {
            // Constrain to slider bounds
            const minX = sliderBg.x - sliderBg.width / 2;
            const maxX = sliderBg.x + sliderBg.width / 2;

            dragX = Phaser.Math.Clamp(dragX, minX, maxX);
            handle.x = dragX;

            // Calculate volume (0-1)
            const volume = (dragX - minX) / sliderBg.width;

            // Update slider fill
            sliderFill.width = sliderBg.width * volume;
            sliderFill.x = minX + sliderFill.width / 2;

            // Save volume setting
            localStorage.setItem('gameVolume', volume.toString());
        });

        // Control type toggle
        const controlTypeText = this.add.text(
            panel.x - 150,
            panel.y,
            'CONTROL TYPE:',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff'
            }
        ).setOrigin(0, 0.5);

        // Get current control type
        const isMouseControl = localStorage.getItem('useMouseControl') === 'true';

        // Create toggle button
        const toggleBg = this.add.rectangle(
            panel.x + 80,
            panel.y,
            200,
            40,
            0x000000
        );
        toggleBg.setStrokeStyle(2, 0x4444aa);

        // Toggle options
        const keyboardBtn = this.add.rectangle(
            toggleBg.x - 50,
            toggleBg.y,
            90,
            36,
            isMouseControl ? 0x222244 : 0x4466cc
        );
        keyboardBtn.setInteractive({ useHandCursor: true });

        const mouseBtn = this.add.rectangle(
            toggleBg.x + 50,
            toggleBg.y,
            90,
            36,
            isMouseControl ? 0x4466cc : 0x222244
        );
        mouseBtn.setInteractive({ useHandCursor: true });

        // Toggle text
        this.add.text(
            keyboardBtn.x,
            keyboardBtn.y,
            'KEYBOARD',
            {
                fontFamily: 'Arial',
                fontSize: 14,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.add.text(
            mouseBtn.x,
            mouseBtn.y,
            'MOUSE',
            {
                fontFamily: 'Arial',
                fontSize: 14,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Toggle handlers
        keyboardBtn.on('pointerdown', () => {
            keyboardBtn.fillColor = 0x4466cc;
            mouseBtn.fillColor = 0x222244;
            localStorage.setItem('useMouseControl', 'false');

            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.3 });
            }
        });

        mouseBtn.on('pointerdown', () => {
            mouseBtn.fillColor = 0x4466cc;
            keyboardBtn.fillColor = 0x222244;
            localStorage.setItem('useMouseControl', 'true');

            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.3 });
            }
        });

        // Close button
        const closeButton = this.add.rectangle(
            this.cameras.main.width / 2,
            panel.y + 150,
            200,
            50,
            0x444488
        ).setInteractive({ useHandCursor: true });

        const closeText = this.add.text(
            this.cameras.main.width / 2,
            panel.y + 150,
            'CLOSE',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Close button hover effect
        closeButton.on('pointerover', () => {
            closeButton.fillColor = 0x5555aa;
            closeButton.scale = 1.05;
            closeText.scale = 1.05;
        });

        closeButton.on('pointerout', () => {
            closeButton.fillColor = 0x444488;
            closeButton.scale = 1;
            closeText.scale = 1;
        });

        // Close button click handler
        closeButton.on('pointerdown', () => {
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.3 });
            }

            // Fade out and destroy panel
            const elements = [
                panel, title, soundText, sliderBg, sliderFill, handle,
                controlTypeText, toggleBg, keyboardBtn, mouseBtn,
                closeButton, closeText
            ];

            this.tweens.add({
                targets: elements,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    elements.forEach(el => el.destroy());
                }
            });
        });
    }

    update() {
        // If you have a background that needs animation, update it here
        if (this.stars1) {
            this.stars1.tilePositionX += 0.2;
            this.stars1.tilePositionY += 0.1;
        }

        if (this.stars2) {
            this.stars2.tilePositionX += 0.1;
            this.stars2.tilePositionY += 0.2;
        }
    }

    createBackground() {
        // Calculate background size to ensure it covers the entire game area
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create starfield background
        const stars1 = this.add.tileSprite(
            width / 2,
            height / 2,
            width,
            height,
            'bgPattern'
        );
        stars1.setTint(0x222244);
        stars1.setDepth(-10);
        this.stars1 = stars1;

        // Second starfield layer for parallax effect
        const stars2 = this.add.tileSprite(
            width / 2,
            height / 2,
            width,
            height,
            'bgPattern'
        );
        stars2.setTint(0x3333aa);
        stars2.setScale(0.5);
        stars2.setDepth(-9);
        stars2.setAlpha(0.7);
        this.stars2 = stars2;

        // Add nebula effect
        const nebulaColors = [0x9955ff, 0x5599ff, 0xff5599];
        for (let i = 0; i < 3; i++) {
            const color = Phaser.Utils.Array.GetRandom(nebulaColors);
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(150, 350);

            const nebula = this.add.circle(x, y, size, color, 0.03);
            nebula.setDepth(-8);

            // Make nebulas slowly pulse
            this.tweens.add({
                targets: nebula,
                alpha: 0.06,
                scale: 1.1,
                duration: 3000 + i * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Add glowing particles in background
        try {
            const particles = this.add.particles(0, 0, 'xp');
            particles.setDepth(-7);

            particles.createEmitter({
                x: { min: 0, max: width },
                y: { min: 0, max: height },
                scale: { start: 0.5, end: 0.1 },
                alpha: { start: 0.5, end: 0 },
                lifespan: 5000,
                speedY: { min: -10, max: 10 },
                speedX: { min: -10, max: 10 },
                frequency: 500,
                blendMode: 'ADD'
            });
        } catch (e) {
            console.warn("Could not create background particles", e);
        }
    }

    createBasicSprites() {
        // Only create textures if they don't already exist
        if (!this.textures.exists('player')) {
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

    showLeaderboard() {
        // Create leaderboard panel
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            550, // Wider panel
            550, // Taller panel
            0x222244,
            0.95
        );
        panel.setStrokeStyle(2, 0x4444aa);

        // Title
        const title = this.add.text(
            this.cameras.main.width / 2,
            panel.y - 240,
            'LEADERBOARD',
            {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Display tabs for global/local scores
        const localTab = this.add.rectangle(
            panel.x - 100,
            panel.y - 200,
            100, 30,
            0x444488
        );
        localTab.setInteractive({ useHandCursor: true });

        const globalTab = this.add.rectangle(
            panel.x + 100,
            panel.y - 200,
            100, 30,
            0x222266
        );
        globalTab.setInteractive({ useHandCursor: true });

        const localText = this.add.text(
            panel.x - 100,
            panel.y - 200,
            'LOCAL',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        const globalText = this.add.text(
            panel.x + 100,
            panel.y - 200,
            'GLOBAL',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#aaaaaa'
            }
        ).setOrigin(0.5);

        // Container for scores
        const scoreContainer = this.add.container(0, 0);

        // Function to display scores
        const displayScores = (isGlobal = false) => {
            // Clear previous scores
            scoreContainer.removeAll(true);

            // Update tab appearance
            localTab.fillColor = isGlobal ? 0x222266 : 0x444488;
            globalTab.fillColor = isGlobal ? 0x444488 : 0x222266;
            localText.setColor(isGlobal ? '#aaaaaa' : '#ffffff');
            globalText.setColor(isGlobal ? '#ffffff' : '#aaaaaa');

            // Get scores based on tab
            let scores;
            if (isGlobal && GAME_STATE.leaderboardService) {
                scores = GAME_STATE.leaderboardService.getGlobalScores();
            } else {
                scores = this.getHighScores();
            }

            // Header row
            const headerTexts = [
                this.add.text(panel.x - 225, panel.y - 160, 'RANK', {
                    fontSize: '14px', color: '#aaaaff', fontFamily: 'Arial'
                }).setOrigin(0, 0.5),

                this.add.text(panel.x - 175, panel.y - 160, 'NAME', {
                    fontSize: '14px', color: '#aaaaff', fontFamily: 'Arial'
                }).setOrigin(0, 0.5),

                this.add.text(panel.x + 50, panel.y - 160, 'SCORE', {
                    fontSize: '14px', color: '#aaaaff', fontFamily: 'Arial'
                }).setOrigin(0, 0.5),

                this.add.text(panel.x + 150, panel.y - 160, 'LEVEL', {
                    fontSize: '14px', color: '#aaaaff', fontFamily: 'Arial'
                }).setOrigin(0, 0.5)
            ];
            scoreContainer.add(headerTexts);

            // Separator line
            const line = this.add.line(
                panel.x, panel.y - 140,
                -225, 0, 225, 0,
                0x4444aa, 0.8
            );
            scoreContainer.add(line);

            // Display scores
            for (let i = 0; i < Math.min(scores.length, 10); i++) {
                const score = scores[i];
                const y = panel.y - 120 + (i * 30);

                // Different colors for own scores vs others
                const isOwnScore = score.device === GAME_STATE.leaderboardService?.getDeviceId();
                const textColor = isOwnScore ? '#ffff88' : '#ffffff';

                // Score row elements
                const rowTexts = [
                    this.add.text(panel.x - 225, y, `${i + 1}.`, {
                        fontSize: '16px', color: textColor, fontFamily: 'Arial'
                    }).setOrigin(0, 0.5),

                    this.add.text(panel.x - 175, y, this.truncateText(score.name, 16), {
                        fontSize: '16px', color: textColor, fontFamily: 'Arial'
                    }).setOrigin(0, 0.5),

                    this.add.text(panel.x + 50, y, score.score.toString(), {
                        fontSize: '16px', color: textColor, fontFamily: 'Arial'
                    }).setOrigin(0, 0.5),

                    this.add.text(panel.x + 150, y, score.level.toString(), {
                        fontSize: '16px', color: textColor, fontFamily: 'Arial'
                    }).setOrigin(0, 0.5)
                ];
                scoreContainer.add(rowTexts);
            }

            // If no scores, show message
            if (scores.length === 0) {
                const noScores = this.add.text(
                    this.cameras.main.width / 2,
                    panel.y,
                    'No scores yet. Play a game!',
                    {
                        fontFamily: 'Arial',
                        fontSize: 20,
                        color: '#aaaaaa',
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5);
                scoreContainer.add(noScores);
            }

            // Add share button for global scores
            if (isGlobal && scores.length > 0 && GAME_STATE.leaderboardService) {
                const shareButton = this.add.rectangle(
                    panel.x,
                    panel.y + 180,
                    200, 40,
                    0x225588
                ).setInteractive({ useHandCursor: true });

                const shareText = this.add.text(
                    panel.x,
                    panel.y + 180,
                    'SHARE LEADERBOARD',
                    {
                        fontFamily: 'Arial',
                        fontSize: 16,
                        color: '#ffffff'
                    }
                ).setOrigin(0.5);

                // Button hover effect
                shareButton.on('pointerover', () => {
                    shareButton.fillColor = 0x3366aa;
                    shareButton.scale = 1.05;
                    shareText.scale = 1.05;
                });

                shareButton.on('pointerout', () => {
                    shareButton.fillColor = 0x225588;
                    shareButton.scale = 1;
                    shareText.scale = 1;
                });

                // Generate shareable URL when clicked
                shareButton.on('pointerdown', () => {
                    playSound(this, 'select', { volume: 0.3 });

                    const url = GAME_STATE.leaderboardService.generateShareableURL();
                    if (url) {
                        this.showShareDialog(url);
                    }
                });

                scoreContainer.add([shareButton, shareText]);
            }
        };

        // Set up tab behavior
        localTab.on('pointerdown', () => {
            playSound(this, 'select', { volume: 0.3 });
            displayScores(false);
        });

        globalTab.on('pointerdown', () => {
            playSound(this, 'select', { volume: 0.3 });
            displayScores(true);
        });

        // Close button
        const closeButton = this.add.rectangle(
            this.cameras.main.width / 2,
            panel.y + 240,
            200,
            50,
            0x444488
        ).setInteractive({ useHandCursor: true });

        const closeText = this.add.text(
            this.cameras.main.width / 2,
            panel.y + 240,
            'CLOSE',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        closeButton.on('pointerover', () => {
            closeButton.fillColor = 0x5555aa;
            closeButton.scale = 1.05;
            closeText.scale = 1.05;
        });

        closeButton.on('pointerout', () => {
            closeButton.fillColor = 0x444488;
            closeButton.scale = 1;
            closeText.scale = 1;
        });

        closeButton.on('pointerdown', () => {
            if (this.sound && this.cache.audio.exists('select')) {
                this.sound.play('select', { volume: 0.3 });
            }

            // Fade out and destroy panel
            const elements = [
                panel, title, closeButton, closeText,
                localTab, globalTab, localText, globalText
            ];

            this.tweens.add({
                targets: elements.concat(scoreContainer.getAll()),
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    elements.forEach(el => el.destroy());
                    scoreContainer.destroy();
                }
            });
        });

        // Show local scores by default
        displayScores(false);
    }

    // Add method to truncate text that's too long
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    // Add method to show share dialog
    showShareDialog(url) {
        // Create a simple modal dialog
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.8
        );
        overlay.setOrigin(0, 0);

        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            500, 300,
            0x333366, 0.95
        );
        panel.setStrokeStyle(2, 0x5555cc);

        const title = this.add.text(
            this.cameras.main.width / 2,
            panel.y - 120,
            'SHARE LEADERBOARD',
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);

        // Create URL display with background
        const urlBg = this.add.rectangle(
            this.cameras.main.width / 2,
            panel.y,
            450, 40,
            0x222244
        );

        const urlText = this.add.text(
            this.cameras.main.width / 2,
            panel.y,
            this.truncateText(url, 50),
            {
                fontFamily: 'monospace',
                fontSize: 14,
                color: '#88ccff'
            }
        ).setOrigin(0.5);

        // Instructions
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            panel.y + 60,
            'Copy this URL to share the leaderboard with friends.\nWhen they open it, their scores will be added too!',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Copy button
        const copyButton = this.add.rectangle(
            this.cameras.main.width / 2,
            panel.y + 120,
            200, 40,
            0x225588
        ).setInteractive({ useHandCursor: true });

        const copyText = this.add.text(
            this.cameras.main.width / 2,
            panel.y + 120,
            'COPY TO CLIPBOARD',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Copy functionality
        copyButton.on('pointerdown', () => {
            playSound(this, 'select', { volume: 0.3 });

            // Use clipboard API or fallback
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(url).then(() => {
                    copyText.setText('COPIED!');
                    this.time.delayedCall(1500, () => {
                        if (copyText.active) {
                            copyText.setText('COPY TO CLIPBOARD');
                        }
                    });
                });
            } else {
                // Fallback using a temporary input element
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    copyText.setText('COPIED!');
                    this.time.delayedCall(1500, () => {
                        if (copyText.active) {
                            copyText.setText('COPY TO CLIPBOARD');
                        }
                    });
                } catch (err) {
                    console.error('Failed to copy URL: ', err);
                    copyText.setText('COPY FAILED');
                }

                document.body.removeChild(textArea);
            }
        });

        // Close button
        const closeButton = this.add.rectangle(
            this.cameras.main.width / 2,
            panel.y + 120 + 50,
            200, 40,
            0x444488
        ).setInteractive({ useHandCursor: true });

        const closeButtonText = this.add.text(
            this.cameras.main.width / 2,
            panel.y + 120 + 50,
            'CLOSE',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        closeButton.on('pointerdown', () => {
            playSound(this, 'select', { volume: 0.3 });

            this.tweens.add({
                targets: [overlay, panel, title, urlBg, urlText, instructions,
                    copyButton, copyText, closeButton, closeButtonText],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    overlay.destroy();
                    panel.destroy();
                    title.destroy();
                    urlBg.destroy();
                    urlText.destroy();
                    instructions.destroy();
                    copyButton.destroy();
                    copyText.destroy();
                    closeButton.destroy();
                    closeButtonText.destroy();
                }
            });
        });
    }

    getHighScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('highScores')) || [];
            return scores.sort((a, b) => b.score - a.score);
        } catch (e) {
            console.error("Error loading high scores:", e);
            return [];
        }
    }
}