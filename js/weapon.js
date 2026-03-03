import { distance } from './utils.js';

export class Weapon {
    constructor(player) {
        this.player = player;
        this.damage = 10;
        this.fireRate = 1; // shots per second
        this.projectileSpeed = 7;
        this.projectileCount = 1;
        this.projectileSize = 5;
        this.projectileSpread = 0.1;
        this.areaMultiplier = 1.0;
        
        this.fireTimer = 0;
    }

    applyUpgrade(type) {
        switch (type) {
            case 'damage':
                this.damage += 10;
                break;
            case 'fireRate':
                // Additive scaling based on base fireRate (1.0)
                this.fireRate += 0.15;
                break;
            case 'projectileCount':
                this.projectileCount += 1;
                break;
            case 'projectileSpeed':
                // Additive scaling based on base speed (7.0)
                this.projectileSpeed += 1.4;
                break;
            case 'area':
                this.areaMultiplier += 0.05;
                break;
        }
    }

    update(deltaTime, enemies, projectiles, deltaTimeFactor) {
        this.fireTimer += deltaTime / 1000;
        
        if (this.fireTimer >= 1 / this.fireRate) {
            this.fireTimer = 0;
            this.fire(enemies, projectiles);
        }
    }

    fire(enemies, projectiles) {
        // Find nearest enemy or random direction
        let targetAngle = Math.random() * Math.PI * 2;
        
        if (enemies.length > 0) {
            let nearestEnemy = null;
            let minDistance = Infinity;
            
            enemies.forEach(enemy => {
                const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestEnemy = enemy;
                }
            });
            
            if (nearestEnemy) {
                targetAngle = Math.atan2(nearestEnemy.y - this.player.y, nearestEnemy.x - this.player.x);
            }
        }

        // Create projectiles
        for (let i = 0; i < this.projectileCount; i++) {
            // Offset projectiles symmetrically around the target angle
            let offset = 0;
            if (this.projectileCount > 1) {
                offset = (i - (this.projectileCount - 1) / 2) * this.projectileSpread;
            }
            
            const angle = targetAngle + offset;
            projectiles.push(new Projectile(
                this.player.x, 
                this.player.y, 
                angle, 
                this.projectileSpeed, 
                this.damage, 
                this.projectileSize * this.areaMultiplier
            ));
        }
    }
}

export class Projectile {
    constructor(x, y, angle, speed, damage, radius) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.radius = radius;
        this.color = 'yellow';
        
        this.lifeTime = 5; // seconds
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
        ctx.closePath();
        ctx.restore();
    }
}
