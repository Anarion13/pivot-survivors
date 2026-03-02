export class Input {
    constructor() {
        this.keys = {};
        this.gameKeys = [
            'KeyW', 'KeyS', 'KeyA', 'KeyD', 
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
            'Escape', 'Space'
        ];
        
        this.keyDownHandler = (e) => {
            if (this.gameKeys.includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        };
        this.keyUpHandler = (e) => {
            if (this.gameKeys.includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = false;
        };
        
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
    }

    destroy() {
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
    }

    isPressed(code) {
        return !!this.keys[code];
    }

    getMovement() {
        let x = 0;
        let y = 0;

        if (this.isPressed('KeyW') || this.isPressed('ArrowUp')) y -= 1;
        if (this.isPressed('KeyS') || this.isPressed('ArrowDown')) y += 1;
        if (this.isPressed('KeyA') || this.isPressed('ArrowLeft')) x -= 1;
        if (this.isPressed('KeyD') || this.isPressed('ArrowRight')) x += 1;

        // Normalize vector
        if (x !== 0 && y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }

        return { x, y };
    }
}
