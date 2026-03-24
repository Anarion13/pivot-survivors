import { distance } from './utils.js';

export class Enemy {
    constructor(x, y, stats = {}) {
        this.x = x;
        this.y = y;
        
        this.radius = stats.radius || 15;
        this.hp = stats.hp || 20;
        this.speed = stats.speed || 2;
        this.damage = stats.damage || 5;
        this.xpDrop = stats.xpDrop || 1;
        this.color = stats.color || 'red';
        this.splitCount = stats.splitCount || 0;

        this.toRemove = false;
    }

    update(player, deltaTime, deltaTimeFactor) {
        // Simple chase AI
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed * deltaTimeFactor;
        this.y += Math.sin(angle) * this.speed * deltaTimeFactor;
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
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

            if (roll > 0.85) {
                // Splitter: splits into 2 smaller enemies on death
                stats.radius = 18;
                stats.hp = 25;
                stats.speed = 1.6;
                stats.damage = 4;
                stats.xpDrop = 2;
                stats.color = '#2E8B57'; // Sea green
                stats.splitCount = 1;
            } else if (roll > 0.7) {
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
