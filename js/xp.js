import { distance } from './utils.js';

export const GEM_TYPE = {
    XP: 'XP',
    FOOD: 'FOOD',
    SPEED: 'SPEED',
    SHIELD: 'SHIELD'
};

export class XPGem {
    constructor(x, y, value, type = GEM_TYPE.XP) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.type = type;
        this.radius = 8;
        
        switch(type) {
            case GEM_TYPE.FOOD:
                this.color = '#9370DB';
                break;
            case GEM_TYPE.SPEED:
                this.color = '#FFD700';
                this.radius = 10;
                break;
            case GEM_TYPE.SHIELD:
                this.color = '#00BFFF';
                this.radius = 10;
                break;
            default:
                this.color = '#32CD32';
        }
        
        this.toRemove = false;
        this.magneticSpeed = 8;
        this.isBeingPickedUp = false;
    }

    update(player, deltaTime, deltaTimeFactor) {
        const dist = distance(this.x, this.y, player.x, player.y);
        
        if (!this.isBeingPickedUp && dist < player.pickupRange) {
            this.isBeingPickedUp = true;
        }

        if (this.isBeingPickedUp) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(angle) * this.magneticSpeed * deltaTimeFactor;
            this.y += Math.sin(angle) * this.magneticSpeed * deltaTimeFactor;
            
            const currentDist = distance(this.x, this.y, player.x, player.y);
            if (currentDist < player.radius + this.radius) {
                switch(this.type) {
                    case GEM_TYPE.FOOD:
                        player.heal(this.value * player.healingMultiplier);
                        break;
                    case GEM_TYPE.SPEED:
                        player.applySpeedBoost(this.value);
                        break;
                    case GEM_TYPE.SHIELD:
                        player.applyShield(this.value);
                        break;
                    default:
                        player.addXP(this.value);
                }
                this.toRemove = true;
            }
        }
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        if (this.type === GEM_TYPE.SPEED) {
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x - camera.x - 4, this.y - camera.y);
            ctx.lineTo(this.x - camera.x + 4, this.y - camera.y);
            ctx.moveTo(this.x - camera.x, this.y - camera.y - 4);
            ctx.lineTo(this.x - camera.x, this.y - camera.y + 4);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (this.type === GEM_TYPE.SHIELD) {
            ctx.strokeStyle = '#1E90FF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x - camera.x, this.y - camera.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(this.x - camera.x - 2, this.y - camera.y - 2, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
        
        ctx.closePath();
        ctx.restore();
    }
}
