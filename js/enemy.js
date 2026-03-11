import { distance } from './utils.js';

export const ENEMY_TYPE = {
    BASIC: 'BASIC',
    RUNNER: 'RUNNER',
    BRUTE: 'BRUTE',
    SHOOTER: 'SHOOTER'
};

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
        this.type = stats.type || ENEMY_TYPE.BASIC;
        
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

export class FastRunner extends Enemy {
    constructor(x, y, stats = {}) {
        const runnerStats = {
            radius: 10,
            hp: 10,
            speed: 4,
            damage: 3,
            xpDrop: 2,
            color: '#FF6B35',
            type: ENEMY_TYPE.RUNNER,
            ...stats
        };
        super(x, y, runnerStats);
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x - camera.x + 3, this.y - camera.y - 3, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFA500';
        ctx.fill();
        
        ctx.closePath();
        ctx.restore();
    }
}

export class TankBrute extends Enemy {
    constructor(x, y, stats = {}) {
        const bruteStats = {
            radius: 25,
            hp: 80,
            speed: 1,
            damage: 15,
            xpDrop: 5,
            color: '#4A0E4E',
            type: ENEMY_TYPE.BRUTE,
            ...stats
        };
        super(x, y, bruteStats);
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.strokeStyle = '#8B008B';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.closePath();
        ctx.restore();
    }
}

export class RangedShooter extends Enemy {
    constructor(x, y, stats = {}) {
        const shooterStats = {
            radius: 12,
            hp: 25,
            speed: 1.5,
            damage: 8,
            xpDrop: 3,
            color: '#00CED1',
            type: ENEMY_TYPE.SHOOTER,
            ...stats
        };
        super(x, y, shooterStats);
        
        this.shootRange = 300;
        this.safeDistance = 200;
        this.fireRate = 0.5;
        this.fireTimer = Math.random() * (1 / this.fireRate);
    }

    update(player, deltaTime, deltaTimeFactor, enemyProjectiles) {
        const dist = distance(this.x, this.y, player.x, player.y);
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        
        if (dist < this.safeDistance) {
            this.x -= Math.cos(angle) * this.speed * deltaTimeFactor;
            this.y -= Math.sin(angle) * this.speed * deltaTimeFactor;
        } else if (dist > this.shootRange) {
            this.x += Math.cos(angle) * this.speed * deltaTimeFactor;
            this.y += Math.sin(angle) * this.speed * deltaTimeFactor;
        }
        
        this.fireTimer += deltaTime / 1000;
        if (this.fireTimer >= 1 / this.fireRate && dist <= this.shootRange) {
            this.fireTimer = 0;
            this.shoot(player, enemyProjectiles);
        }
    }

    shoot(player, enemyProjectiles) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        enemyProjectiles.push(new EnemyProjectile(
            this.x,
            this.y,
            angle,
            3,
            this.damage
        ));
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x - camera.x, this.y - camera.y);
        ctx.lineTo(this.x - camera.x + this.radius, this.y - camera.y);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.closePath();
        ctx.restore();
    }
}

export class EnemyProjectile {
    constructor(x, y, angle, speed, damage) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.radius = 6;
        this.color = '#FF1493';
        
        this.lifeTime = 4;
        this.elapsedLife = 0;
        this.toRemove = false;
    }

    update(deltaTime, deltaTimeFactor) {
        this.x += this.vx * deltaTimeFactor;
        this.y += this.vy * deltaTimeFactor;
        
        this.elapsedLife += deltaTime / 1000;
        if (this.elapsedLife >= this.lifeTime) {
            this.toRemove = true;
        }
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 20, 147, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.closePath();
        ctx.restore();
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
        
        const rand = Math.random();
        const time = this.game.elapsedTime;
        
        if (time < 30) {
            this.game.enemies.push(new Enemy(spawnX, spawnY));
        } else if (time < 60) {
            if (rand < 0.7) {
                this.game.enemies.push(new Enemy(spawnX, spawnY));
            } else if (rand < 0.85) {
                this.game.enemies.push(new FastRunner(spawnX, spawnY));
            } else {
                this.game.enemies.push(new RangedShooter(spawnX, spawnY));
            }
        } else if (time < 120) {
            if (rand < 0.5) {
                this.game.enemies.push(new Enemy(spawnX, spawnY, {
                    hp: 30,
                    speed: 2.2,
                    damage: 8,
                    xpDrop: 2,
                    color: '#8B0000'
                }));
            } else if (rand < 0.7) {
                this.game.enemies.push(new FastRunner(spawnX, spawnY));
            } else if (rand < 0.85) {
                this.game.enemies.push(new RangedShooter(spawnX, spawnY));
            } else {
                this.game.enemies.push(new TankBrute(spawnX, spawnY));
            }
        } else {
            const scaleFactor = 1 + (time - 120) / 120;
            if (rand < 0.4) {
                this.game.enemies.push(new Enemy(spawnX, spawnY, {
                    hp: Math.floor(30 * scaleFactor),
                    speed: 2.2 * Math.min(scaleFactor, 1.5),
                    damage: Math.floor(8 * scaleFactor),
                    xpDrop: Math.floor(2 * scaleFactor),
                    color: '#8B0000'
                }));
            } else if (rand < 0.6) {
                this.game.enemies.push(new FastRunner(spawnX, spawnY, {
                    hp: Math.floor(10 * scaleFactor),
                    speed: 4 * Math.min(scaleFactor, 1.3)
                }));
            } else if (rand < 0.8) {
                this.game.enemies.push(new RangedShooter(spawnX, spawnY, {
                    hp: Math.floor(25 * scaleFactor),
                    damage: Math.floor(8 * scaleFactor)
                }));
            } else {
                this.game.enemies.push(new TankBrute(spawnX, spawnY, {
                    hp: Math.floor(80 * scaleFactor),
                    damage: Math.floor(15 * scaleFactor)
                }));
            }
        }
    }
}
