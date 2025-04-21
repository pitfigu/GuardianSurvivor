class Enemy {
    constructor(scene, x, y, type = 'basic') {
        this.scene = scene;
        this.type = type;

        // Create enemy sprite
        this.sprite = scene.physics.add.sprite(x, y, 'enemy');
        this.sprite.setData('ref', this);

        // Enemy stats based on type
        this.setStats(type);
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

        xp.setData('xpValue', this.xpValue);

        // Add to XP gems group for collection
        this.scene.enemyManager.xpGems.add(xp);
    }

    destroy() {
        this.sprite.destroy();
    }
}