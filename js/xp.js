import { distance } from './utils.js';

export class XPGem {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 8;
        this.color = '#32CD32'; // LimeGreen
        this.toRemove = false;
        
        this.pickupRange = 100;
        this.magneticSpeed = 8;
        this.isBeingPickedUp = false;
    }

    update(player, deltaTime, deltaTimeFactor) {
        const dist = distance(this.x, this.y, player.x, player.y);
        
        if (!this.isBeingPickedUp && dist < this.pickupRange) {
            this.isBeingPickedUp = true;
        }

        if (this.isBeingPickedUp) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(angle) * this.magneticSpeed * deltaTimeFactor;
            this.y += Math.sin(angle) * this.magneticSpeed * deltaTimeFactor;
            
            if (dist < player.radius + this.radius) {
                player.addXP(this.value);
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
