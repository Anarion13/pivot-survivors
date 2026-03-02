export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = 'blue';
        
        // Stats
        this.maxHp = 100;
        this.hp = 100;
        this.speed = 4; // pixels per frame (at 60fps)
        
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 10;
        this.pendingLevelUps = 0;
        this.onLevelUp = null;
        
        this.invincibilityTime = 0; // Current remaining i-frames
        this.iFrameDuration = 0.5; // seconds
        this.flashTimer = 0;
        
        this.isDead = false;
    }

    update(input, deltaTime, deltaTimeFactor) {
        if (this.isDead) return;

        // Check for pending level ups
        if (this.pendingLevelUps > 0) {
            this.pendingLevelUps--;
            this.onLevelUp?.();
        }

        const move = input.getMovement();
        this.x += move.x * this.speed * deltaTimeFactor;
        this.y += move.y * this.speed * deltaTimeFactor;

        if (this.invincibilityTime > 0) {
            this.invincibilityTime -= deltaTime / 1000;
            this.flashTimer += deltaTime;
        } else {
            this.flashTimer = 0;
        }
    }

    addXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.xpToNextLevel = Math.floor(10 * Math.pow(this.level, 1.5));
            this.pendingLevelUps += 1;
        }
    }

    takeDamage(amount) {
        if (this.invincibilityTime > 0 || this.isDead) return;
        
        this.hp -= amount;
        this.invincibilityTime = this.iFrameDuration;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        
        // Flash if invincible
        if (this.invincibilityTime > 0 && Math.floor(this.flashTimer / 100) % 2 === 0) {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}
