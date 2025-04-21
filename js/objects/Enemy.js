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

        if (this.type === 'tank') {
            this.sprite.body.setSize(28, 28);
            this.sprite.body.setOffset(2, 2);
        } else if (this.type === 'fast') {
            this.sprite.body.setSize(22, 22);
            this.sprite.body.setOffset(5, 5);
        } else {
            // Basic enemy
            this.sprite.body.setSize(24, 24);
            this.sprite.body.setOffset(4, 4);
        }

        // Add shadow beneath enemy
        this.shadow = scene.add.ellipse(x, y + 20, 30, 10, 0x000000, 0.3);

        // Enemy stats based on type
        this.setStats(type);

        // Add a subtle pulsating effect
        scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 800 + Math.random() * 600
        });
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
        this.health -= amount;

        // Visual feedback
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.5,
            duration: 50,
            yoyo: true
        });

        if (this.health <= 0) {
            // Death is handled in collision logic in MainScene
        }
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
        if (this.shadow) this.shadow.destroy();
        this.sprite.destroy();
    }
}