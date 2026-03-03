import { distance } from './utils.js';

export const GEM_TYPE = {
    XP: 'XP',
    FOOD: 'FOOD'
};

export class XPGem {
    constructor(x, y, value, type = GEM_TYPE.XP) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.type = type;
        this.radius = 8;
        this.color = type === GEM_TYPE.FOOD ? '#9370DB' : '#32CD32'; // Purple vs LimeGreen
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
                if (this.type === GEM_TYPE.FOOD) {
                    player.heal(this.value * player.healingMultiplier);
                } else {
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
        
        // Shine effect
        ctx.beginPath();
        ctx.arc(this.x - camera.x - 2, this.y - camera.y - 2, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        ctx.closePath();
        ctx.restore();
    }
}
