import { Game } from './game.js';
import { Input } from './input.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const input = new Input();
    const game = new Game(canvas, input);

    let lastTime = 0;

    function loop(timeStamp) {
        if (lastTime === 0) {
            lastTime = timeStamp;
            return requestAnimationFrame(loop);
        }
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        // Cap deltaTime to avoid huge jumps
        const cappedDeltaTime = Math.min(deltaTime, 100);
        
        // Expected frame time at 60fps is 16.67ms
        const deltaTimeFactor = cappedDeltaTime / (1000 / 60);
        
        game.update(cappedDeltaTime, deltaTimeFactor);
        game.draw();

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    // Escape key to pause
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            // e.preventDefault() is handled by input.js
            game.pause();
        }
    });
});
