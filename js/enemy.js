import { distance } from './utils.js';

export class Enemy {
    constructor(x, y, stats = {}) {
        this.x = x;
        this.y = y;
        
        this.radius = stats.radius || 15;
        this.hp = stats.hp || 20;
        this.maxHp = this.hp;
        this.speed = stats.speed || 2;
        this.damage = stats.damage || 5;
        this.xpDrop = stats.xpDrop || 1;
        this.color = stats.color || 'red';
        this.splitCount = stats.splitCount || 0;

        // Dasher properties
        this.isDasher = stats.isDasher || false;
        this.dashCooldown = stats.dashCooldown || 2.0; // seconds between dashes
        this.dashSpeed = stats.dashSpeed || 8;
        this.dashDuration = stats.dashDuration || 0.3; // seconds
        this.dashTimer = this.dashCooldown; // time until next dash
        this.dashTimeRemaining = 0;
        this.dashAngle = 0;

        // Bomber properties
        this.isBomber = stats.isBomber || false;
        this.explosionRadius = stats.explosionRadius || 80;
        this.explosionDamage = stats.explosionDamage || 15;

        // Healer properties
        this.isHealer = stats.isHealer || false;
        this.healRadius = stats.healRadius || 120;
        this.healAmount = stats.healAmount || 5;
        this.healInterval = stats.healInterval || 1.0; // seconds
        this.healTimer = 0;

        this.toRemove = false;
    }

    update(player, deltaTime, deltaTimeFactor, allEnemies) {
        const dt = deltaTime / 1000;

        // Healer: periodically heal nearby enemies
        if (this.isHealer && allEnemies) {
            this.healTimer += dt;
            if (this.healTimer >= this.healInterval) {
                this.healTimer = 0;
                for (const other of allEnemies) {
                    if (other === this || other.toRemove) continue;
                    const dist = distance(this.x, this.y, other.x, other.y);
                    if (dist < this.healRadius) {
                        other.hp = Math.min(other.hp + this.healAmount, other.maxHp || other.hp + this.healAmount);
                    }
                }
            }
        }

        if (this.isDasher) {
            if (this.dashTimeRemaining > 0) {
                // Currently dashing
                this.dashTimeRemaining -= dt;
                this.x += Math.cos(this.dashAngle) * this.dashSpeed * deltaTimeFactor;
                this.y += Math.sin(this.dashAngle) * this.dashSpeed * deltaTimeFactor;
            } else {
                // Normal movement + cooldown
                this.dashTimer -= dt;
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                this.x += Math.cos(angle) * this.speed * deltaTimeFactor;
                this.y += Math.sin(angle) * this.speed * deltaTimeFactor;

                if (this.dashTimer <= 0) {
                    // Start a dash toward the player
                    this.dashAngle = Math.atan2(player.y - this.y, player.x - this.x);
                    this.dashTimeRemaining = this.dashDuration;
                    this.dashTimer = this.dashCooldown;
                }
            }
        } else {
            // Simple chase AI
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(angle) * this.speed * deltaTimeFactor;
            this.y += Math.sin(angle) * this.speed * deltaTimeFactor;
        }
    }

    draw(ctx, camera) {
        ctx.save();

        // Healer aura
        if (this.isHealer) {
            ctx.beginPath();
            ctx.arc(this.x - camera.x, this.y - camera.y, this.healRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 128, 0.06)';
            ctx.fill();
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Cross symbol on healer
        if (this.isHealer) {
            ctx.fillStyle = 'white';
            const cx = this.x - camera.x;
            const cy = this.y - camera.y;
            const s = this.radius * 0.3;
            ctx.fillRect(cx - s, cy - s / 3, s * 2, s * 0.66);
            ctx.fillRect(cx - s / 3, cy - s, s * 0.66, s * 2);
        }

        ctx.closePath();
        ctx.restore();
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.toRemove = true;
        }
    }
}

export class EnemySpawner {
    constructor(game) {
        this.game = game;
        this.spawnRate = 1.0; // enemies per second
        this.spawnTimer = 0;
        this.scalingInterval = 30; // seconds
        this.lastScalingTime = 0;
        this.maxEnemies = 200;
    }

    update(deltaTime) {
        this.spawnTimer += deltaTime / 1000;
        
        // Scale spawn rate
        if (this.game.elapsedTime - this.lastScalingTime >= this.scalingInterval) {
            this.spawnRate *= 1.2;
            this.lastScalingTime = this.game.elapsedTime;
        }
        
        if (this.spawnTimer >= 1 / this.spawnRate) {
            this.spawnTimer = 0;
            if (this.game.enemies.length < this.maxEnemies) {
                this.spawnEnemy();
            }
        }
    }

    spawnEnemy() {
        const player = this.game.player;
        const radius = Math.max(this.game.canvas.width, this.game.canvas.height) * 0.7;
        const angle = Math.random() * Math.PI * 2;
        
        const spawnX = player.x + Math.cos(angle) * radius;
        const spawnY = player.y + Math.sin(angle) * radius;
        
        // Base stats
        let stats = {
            radius: 15,
            hp: 20,
            speed: 2,
            damage: 5,
            xpDrop: 1,
            color: 'red'
        };

        // Scale stats after 60 seconds
        if (this.game.elapsedTime > 60) {
            const scaleFactor = 1.5;
            const speedBoost = 1.1;
            const roll = Math.random();

            if (roll > 0.96) {
                // Healer: heals nearby enemies, marked with a cross
                stats.radius = 14;
                stats.hp = 18;
                stats.speed = 1.6;
                stats.damage = 3;
                stats.xpDrop = 4;
                stats.color = '#00CED1'; // Dark turquoise
                stats.isHealer = true;
                stats.healRadius = 120;
                stats.healAmount = 5;
                stats.healInterval = 1.0;
            } else if (roll > 0.92) {
                // Bomber: explodes on death dealing area damage
                stats.radius = 12;
                stats.hp = 10;
                stats.speed = 3.0;
                stats.damage = 3;
                stats.xpDrop = 2;
                stats.color = '#FFD700'; // Gold
                stats.isBomber = true;
                stats.explosionRadius = 80;
                stats.explosionDamage = 15;
            } else if (roll > 0.88) {
                // Tank: slow, large, high HP
                stats.radius = 28;
                stats.hp = Math.floor(60 * scaleFactor);
                stats.speed = 1.0;
                stats.damage = 12;
                stats.xpDrop = 5;
                stats.color = '#4B0082'; // Indigo
            } else if (roll > 0.82) {
                // Dasher: fast bursts toward the player
                stats.radius = 12;
                stats.hp = 15;
                stats.speed = 1.4;
                stats.damage = 6;
                stats.xpDrop = 2;
                stats.color = '#FF8C00'; // Dark orange
                stats.isDasher = true;
                stats.dashCooldown = 2.0;
                stats.dashSpeed = 8;
                stats.dashDuration = 0.3;
            } else if (roll > 0.72) {
                // Splitter: splits into 2 smaller enemies on death
                stats.radius = 18;
                stats.hp = 25;
                stats.speed = 1.6;
                stats.damage = 4;
                stats.xpDrop = 2;
                stats.color = '#2E8B57'; // Sea green
                stats.splitCount = 1;
            } else if (roll > 0.6) {
                // Tougher variant
                stats.radius = 20;
                stats.hp = Math.floor(20 * scaleFactor);
                stats.speed = 2 * speedBoost;
                stats.damage = 8;
                stats.xpDrop = 3;
                stats.color = '#8B0000'; // Dark red
            }
        }
        
        this.game.enemies.push(new Enemy(spawnX, spawnY, stats));
    }
}
