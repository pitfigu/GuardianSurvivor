class Enemy {
    constructor(scene, x, y, type = 'basic') {
        this.scene = scene;
        this.type = type;

        // Create enemy sprite with the right texture based on type
        let texture = 'enemy';
        if (type === 'fast') texture = 'fastEnemy';
        if (type === 'tank') texture = 'tankEnemy';

        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setData('ref', this);

        // Add shadow beneath enemy
        this.shadow = scene.add.ellipse(x, y + 10, 20, 6, 0x000000, 0.3);
        this.shadow.setDepth(5);

        // Add visual enhancements based on type
        switch (type) {
            case 'fast':
                // Fast enemy has trail effect
                try {
                    const trail = scene.add.particles(x, y, 'fastEnemy', {
                        scale: { start: 0.5, end: 0 },
                        alpha: { start: 0.3, end: 0 },
                        speed: 0,
                        lifespan: 300,
                        blendMode: 'ADD',
                        frequency: 50
                    });
                    trail.setDepth(4);
                    this.trail = trail;
                } catch (e) {
                    console.warn("Could not create enemy trail", e);
                }
                break;

            case 'tank':
                // Tank enemy has pulsing aura
                this.aura = scene.add.sprite(x, y, 'tankEnemy');
                this.aura.setScale(1.3);
                this.aura.setAlpha(0.2);
                this.aura.setTint(0xff0000);
                this.aura.setBlendMode(Phaser.BlendModes.ADD);
                this.aura.setDepth(4);

                scene.tweens.add({
                    targets: this.aura,
                    scale: 1.5,
                    alpha: 0.1,
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                break;

            default:
                // Basic enemy has simple pulsating effect
                scene.tweens.add({
                    targets: this.sprite,
                    scale: 1.1,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                break;
        }

        // Enemy stats based on type
        this.setStats(type);
    }

    update() {
        const player = this.scene.player;

        // Move toward player
        if (player && player.sprite.active) {
            const direction = new Phaser.Math.Vector2(
                player.sprite.x - this.sprite.x,
                player.sprite.y - this.sprite.y
            ).normalize();

            this.sprite.setVelocity(
                direction.x * this.speed,
                direction.y * this.speed
            );

            // Update shadow position
            if (this.shadow) {
                this.shadow.x = this.sprite.x;
                this.shadow.y = this.sprite.y + 10;
            }

            // Update aura/trail position
            if (this.aura) {
                this.aura.x = this.sprite.x;
                this.aura.y = this.sprite.y;
            }

            if (this.trail) {
                this.trail.setPosition(this.sprite.x, this.sprite.y);
            }

            // Rotate sprite to face player
            this.sprite.rotation = Math.atan2(direction.y, direction.x);
        } else {
            this.sprite.setVelocity(0);
        }
    }

    destroy() {
        if (this.shadow) this.shadow.destroy();
        if (this.aura) this.aura.destroy();
        if (this.trail) this.trail.destroy();
        if (this.sprite) this.sprite.destroy();
    }

    setStats(type) {
        switch (type) {
            case 'fast':
                this.health = 15;
                this.speed = 120;
                this.damage = 5;
                this.points = 15;
                this.xpValue = 2;
                this.sprite.setTint(0x00ffff);
                break;
            case 'tank':
                this.health = 50;
                this.speed = 50;
                this.damage = 10;
                this.points = 25;
                this.xpValue = 3;
                this.sprite.setTint(0xff0000);
                break;
            case 'basic':
            default:
                this.health = 30;
                this.speed = 70;
                this.damage = 10;
                this.points = 10;
                this.xpValue = 1;
                break;
        }
    }

    update() {
        const player = this.scene.player;

        // Move toward player
        if (player && player.sprite.active) {
            const direction = new Phaser.Math.Vector2(
                player.sprite.x - this.sprite.x,
                player.sprite.y - this.sprite.y
            ).normalize();

            this.sprite.setVelocity(
                direction.x * this.speed,
                direction.y * this.speed
            );

            // Update shadow position
            if (this.shadow) {
                this.shadow.x = this.sprite.x;
                this.shadow.y = this.sprite.y + 20;
            }
        } else {
            this.sprite.setVelocity(0);
        }
    }

    takeDamage(amount) {
        // Make sure health is a number
        if (typeof this.health !== 'number') {
            this.health = 30; // Default health if not set
        }

        this.health -= amount;

        // Add a visual flash effect
        if (this.sprite && this.sprite.active) {
            // Flash white
            this.sprite.setTint(0xffffff);

            // Reset after a short delay
            this.scene.time.delayedCall(100, () => {
                if (this.sprite && this.sprite.active) {
                    // Reset tint based on enemy type
                    if (this.type === 'fast') {
                        this.sprite.setTint(0x00ccff);
                    } else if (this.type === 'tank') {
                        this.sprite.setTint(0xdd0000);
                    } else {
                        this.sprite.clearTint();
                    }
                }
            });

            // Visual damage number
            const damageText = this.scene.add.text(
                this.sprite.x,
                this.sprite.y - 20,
                `-${amount}`,
                {
                    fontSize: '16px',
                    color: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            );
            damageText.setOrigin(0.5);

            this.scene.tweens.add({
                targets: damageText,
                y: damageText.y - 30,
                alpha: 0,
                duration: 800,
                onComplete: () => damageText.destroy()
            });
        }

        console.log(`Enemy took ${amount} damage. Health: ${this.health}`);
    }

    dropXP() {
        const xp = this.scene.physics.add.sprite(
            this.sprite.x,
            this.sprite.y,
            'xp'
        );

        // Set smaller hitbox for XP gem
        xp.body.setSize(8, 8);
        xp.body.setOffset(4, 4);

        xp.setData('xpValue', this.xpValue);

        // Add to XP gems group for collection
        this.scene.enemyManager.xpGems.add(xp);
    }

    destroy() {
        if (this.shadow && this.shadow.active) this.shadow.destroy();
        if (this.sprite && this.sprite.active) this.sprite.destroy();
    }
}