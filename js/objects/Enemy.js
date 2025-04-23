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
                this.damage = GAME_SETTINGS.enemyDamage.fast || 5;
                this.points = 15;
                this.xpValue = 2;
                this.sprite.setTint(0x00ffff);
                break;

            case 'tank':
                this.health = 50;
                this.speed = 50;
                this.damage = GAME_SETTINGS.enemyDamage.tank || 10;
                this.points = 25;
                this.xpValue = 3;
                this.sprite.setTint(0xff0000);
                break;

            case 'shooter':
                this.health = 25;
                this.speed = 60;
                this.damage = GAME_SETTINGS.enemyDamage.shooter || 8;
                this.points = 30;
                this.xpValue = 3;
                this.sprite.setTint(0xff00ff);
                this.rangedAttack = true;
                this.attackRange = 200;
                this.attackCooldown = 2000;
                this.lastAttack = 0;
                break;

            case 'explosive':
                this.health = 40;
                this.speed = 40;
                this.damage = GAME_SETTINGS.enemyDamage.explosive || 20;
                this.points = 35;
                this.xpValue = 4;
                this.sprite.setTint(0xff6600);
                this.explodeOnDeath = true;
                this.explosionRadius = 100;
                break;

            case 'boss':
                this.health = 500;
                this.speed = 30;
                this.damage = GAME_SETTINGS.enemyDamage.boss || 20;
                this.points = 200;
                this.xpValue = 20;
                this.sprite.setScale(2.5);
                this.sprite.setTint(0xaa00aa);
                // Boss can use multiple attack patterns
                this.attackPatterns = ['charge', 'summon', 'ranged'];
                this.currentPattern = 'normal';
                this.patternCooldown = 5000;
                this.lastPatternChange = 0;
                break;

            case 'basic':
            default:
                this.health = 30;
                this.speed = 70;
                this.damage = GAME_SETTINGS.enemyDamage.basic || 10;
                this.points = 10;
                this.xpValue = 1;
                break;
        }
    }

    update(time, delta) {
        const player = this.scene.player;

        // Skip if no player or game is paused
        if (!player || !player.sprite || !player.sprite.active || this.scene.paused) {
            return;
        }

        // Base movement toward player
        const direction = new Phaser.Math.Vector2(
            player.sprite.x - this.sprite.x,
            player.sprite.y - this.sprite.y
        ).normalize();

        const distToPlayer = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        // Handle different enemy types
        switch (this.type) {
            case 'shooter':
                // Stay at range and shoot
                if (distToPlayer < this.attackRange) {
                    // Stop and attack
                    this.sprite.setVelocity(0, 0);

                    // Attack if cooldown elapsed
                    if (time > this.lastAttack + this.attackCooldown) {
                        this.rangedAttack(player);
                        this.lastAttack = time;
                    }
                } else {
                    // Move toward player
                    this.sprite.setVelocity(
                        direction.x * this.speed,
                        direction.y * this.speed
                    );
                }
                break;

            case 'boss':
                // Boss uses attack patterns
                if (time > this.lastPatternChange + this.patternCooldown) {
                    this.changeAttackPattern();
                    this.lastPatternChange = time;
                }

                // Handle current pattern
                switch (this.currentPattern) {
                    case 'charge':
                        // Charge at player with increased speed
                        this.sprite.setVelocity(
                            direction.x * this.speed * 2,
                            direction.y * this.speed * 2
                        );
                        break;

                    case 'summon':
                        // Summon minions and move slowly
                        this.sprite.setVelocity(
                            direction.x * this.speed * 0.5,
                            direction.y * this.speed * 0.5
                        );

                        // Try to summon every 2 seconds
                        if (time % 2000 < 20) {
                            this.summonMinions();
                        }
                        break;

                    case 'ranged':
                        // Attack from range
                        if (time % 1000 < 20) {
                            this.bossRangedAttack();
                        }

                        // Move at medium speed
                        this.sprite.setVelocity(
                            direction.x * this.speed * 0.8,
                            direction.y * this.speed * 0.8
                        );
                        break;

                    default:
                        // Normal movement
                        this.sprite.setVelocity(
                            direction.x * this.speed,
                            direction.y * this.speed
                        );
                        break;
                }
                break;

            default:
                // Standard movement for other enemy types
                this.sprite.setVelocity(
                    direction.x * this.speed,
                    direction.y * this.speed
                );
                break;
        }

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
    }

    // Add methods for new enemy behaviors
    rangedAttack(player) {
        // Create a projectile
        const projectile = this.scene.physics.add.sprite(
            this.sprite.x, this.sprite.y, 'projectile'
        );
        projectile.setTint(0xff00ff);
        projectile.setData('damage', this.damage / 2);
        projectile.setData('enemyProjectile', true);

        // Calculate direction to player
        const direction = new Phaser.Math.Vector2(
            player.sprite.x - this.sprite.x,
            player.sprite.y - this.sprite.y
        ).normalize();

        // Set velocity
        const speed = 150;
        projectile.setVelocity(
            direction.x * speed,
            direction.y * speed
        );

        // Rotate to face direction
        projectile.rotation = Math.atan2(direction.y, direction.x);

        // Add to enemy projectiles group
        if (this.scene.enemyManager.enemyProjectiles) {
            this.scene.enemyManager.enemyProjectiles.add(projectile);
        }

        // Destroy after time
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
                if (projectile.active) projectile.destroy();
            }
        });
    }

    bossRangedAttack() {
        // Fire multiple projectiles in a spread
        const numberOfProjectiles = 5;
        const spreadAngle = 90; // degrees
        const baseAngle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            this.scene.player.sprite.x, this.scene.player.sprite.y
        );

        for (let i = 0; i < numberOfProjectiles; i++) {
            // Calculate angle for this projectile
            const angle = baseAngle +
                Phaser.Math.DegToRad(spreadAngle / 2 - (spreadAngle / (numberOfProjectiles - 1)) * i);

            // Create projectile
            const projectile = this.scene.physics.add.sprite(
                this.sprite.x, this.sprite.y, 'projectile'
            );
            projectile.setTint(0xaa00aa);
            projectile.setScale(1.5);
            projectile.setData('damage', this.damage / 3);
            projectile.setData('enemyProjectile', true);

            // Set velocity based on angle
            const speed = 120;
            projectile.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            // Rotate to face direction
            projectile.rotation = angle;

            // Add to enemy projectiles group
            if (this.scene.enemyManager.enemyProjectiles) {
                this.scene.enemyManager.enemyProjectiles.add(projectile);
            }

            // Destroy after time
            this.scene.time.addEvent({
                delay: 3000,
                callback: () => {
                    if (projectile.active) projectile.destroy();
                }
            });
        }
    }

    summonMinions() {
        // Try to spawn 2-3 basic enemies near boss
        const count = 2 + Math.floor(Math.random() * 2);

        for (let i = 0; i < count; i++) {
            // Calculate position around boss
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const x = this.sprite.x + Math.cos(angle) * distance;
            const y = this.sprite.y + Math.sin(angle) * distance;

            // Create basic enemy
            this.scene.enemyManager.createEnemyAt(x, y, 'basic');
        }

        // Visual effect for summoning
        const summonEffect = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            80, 0x8800ff, 0.4
        );

        this.scene.tweens.add({
            targets: summonEffect,
            scale: 1.5,
            alpha: 0,
            duration: 800,
            onComplete: () => summonEffect.destroy()
        });
    }

    changeAttackPattern() {
        // Select a random attack pattern
        const patterns = this.attackPatterns || ['normal'];
        this.currentPattern = Phaser.Utils.Array.GetRandom(patterns);

        // Visual indicator of pattern change
        const indicator = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 40,
            `${this.currentPattern.toUpperCase()}!`,
            {
                fontSize: '18px',
                color: '#ff00ff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        indicator.setOrigin(0.5);

        this.scene.tweens.add({
            targets: indicator,
            y: indicator.y - 30,
            alpha: 0,
            duration: 1500,
            onComplete: () => indicator.destroy()
        });
    }

    // Explosive enemy death
    explode() {
        // Create explosion effect
        const explosion = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            this.explosionRadius, 0xff6600, 0.6
        );

        // Play explosion sound
        if (this.scene.sound && this.scene.cache.audio.exists('hit')) {
            this.scene.sound.play('hit', { volume: 0.6, rate: 0.7 });
        }

        // Animate explosion
        this.scene.tweens.add({
            targets: explosion,
            scale: 1.3,
            alpha: 0,
            duration: 500,
            onComplete: () => explosion.destroy()
        });

        // Damage player if in range
        if (this.scene.player) {
            const distToPlayer = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.scene.player.sprite.x, this.scene.player.sprite.y
            );

            if (distToPlayer <= this.explosionRadius) {
                // Calculate damage based on distance
                const damageMultiplier = 1 - (distToPlayer / this.explosionRadius) * 0.7;
                const damage = Math.ceil(this.damage * damageMultiplier);

                this.scene.player.takeDamage(damage);
            }
        }

        // Damage other enemies in range (reduced damage)
        const enemies = this.scene.enemyManager.enemies.getChildren();
        for (const enemySprite of enemies) {
            const enemy = enemySprite.getData('ref');
            if (!enemy || enemy === this) continue;

            const distance = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                enemySprite.x, enemySprite.y
            );

            if (distance <= this.explosionRadius) {
                const damageMultiplier = 0.5 * (1 - (distance / this.explosionRadius));
                const damage = Math.ceil(this.damage * damageMultiplier);

                enemy.takeDamage(damage);
            }
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