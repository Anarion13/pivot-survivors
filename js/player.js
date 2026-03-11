export class Player {
    static IFRAME_DURATION = 0.5; // seconds
    static FLASH_INTERVAL = 0.1; // seconds
    static SPEED_BOOST_DURATION = 5; // seconds
    static SHIELD_DURATION = 3; // seconds

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = 'blue';
        
        // Stats
        this.maxHp = 100;
        this.hp = 100;
        this.baseSpeed = 4;
        this.speed = 4; // pixels per frame (at 60fps)
        
                // Perk Stats
                this.pickupRange = 100;
                this.xpMultiplier = 1.0;
                this.revivals = 0;
                this.armor = 0;
                this.maxHpMultiplier = 1.0;
                this.healingMultiplier = 1.0;
                
                this.level = 1;
                this.xp = 0;
                this.xpToNextLevel = 8;
                this.pendingLevelUps = 0;
                this.onLevelUp = null;
                
                this.invincibilityTime = 0; // Current remaining i-frames
                this.flashTimer = 0;
                
                this.speedBoostTime = 0;
                this.speedBoostMultiplier = 2;
                this.shieldTime = 0;
                
                this.isDead = false;
            }
        
            update(input, deltaTime, deltaTimeFactor) {
                if (this.isDead) return;
        
                // Check for pending level ups
                if (this.pendingLevelUps > 0) {
                    this.pendingLevelUps--;
                    this.onLevelUp?.();
                }
        
                if (this.speedBoostTime > 0) {
                    this.speedBoostTime -= deltaTime / 1000;
                    this.speed = this.baseSpeed * this.speedBoostMultiplier;
                } else {
                    this.speed = this.baseSpeed;
                }
        
                if (this.shieldTime > 0) {
                    this.shieldTime -= deltaTime / 1000;
                }
        
                const move = input.getMovement();
                this.x += move.x * this.speed * deltaTimeFactor;
                this.y += move.y * this.speed * deltaTimeFactor;
        
                if (this.invincibilityTime > 0) {
                    this.invincibilityTime -= deltaTime / 1000;
                    this.flashTimer += deltaTime / 1000;
                } else {
                    this.flashTimer = 0;
                }
            }
        
            addXP(amount) {
                this.xp += amount * this.xpMultiplier;
                while (this.xp >= this.xpToNextLevel) {
                    this.xp -= this.xpToNextLevel;
                    this.level++;
                    this.xpToNextLevel = Math.floor(10 * Math.pow(this.level, 1.5));
                    this.pendingLevelUps += 1;
                }
            }
        
            heal(amount) {
                this.hp = Math.min(this.maxHp, this.hp + amount);
            }
        
            applySpeedBoost(duration) {
                this.speedBoostTime = duration;
            }
        
            applyShield(duration) {
                this.shieldTime = duration;
            }
        
            takeDamage(amount) {
                if (this.invincibilityTime > 0 || this.isDead || this.shieldTime > 0) return;
                
                const actualDamage = Math.max(1, amount - this.armor);
                this.hp -= actualDamage;
                this.invincibilityTime = Player.IFRAME_DURATION;
                
                if (this.hp <= 0) {
                    if (this.revivals > 0) {
                        this.revivals--;
                        this.hp = this.maxHp / 2;
                        // Use Math.max to prevent overwriting longer existing iframes
                        this.invincibilityTime = Math.max(this.invincibilityTime, Player.IFRAME_DURATION * 2);
                    } else {
                        this.hp = 0;
                        this.isDead = true;
                    }
                }
            }
    draw(ctx, camera) {
        ctx.save();
        
        if (this.shieldTime > 0) {
            ctx.beginPath();
            ctx.arc(this.x - camera.x, this.y - camera.y, this.radius + 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x - camera.x, this.y - camera.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.3)';
            ctx.lineWidth = 5;
            ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        
        // Flash if invincible
        if (this.invincibilityTime > 0 && Math.floor(this.flashTimer / Player.FLASH_INTERVAL) % 2 === 0) {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        } else if (this.speedBoostTime > 0) {
            ctx.fillStyle = '#4169E1';
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fill();
        
        if (this.speedBoostTime > 0) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.closePath();
        ctx.restore();
    }
}
