import { Player } from './player.js';
import { Weapon } from './weapon.js';
import { EnemySpawner } from './enemy.js';
import { XPGem, GEM_TYPE } from './xp.js';
import { checkCircleCollision } from './collision.js';
import { formatTime, shuffle } from './utils.js';
import { Input } from './input.js';

export const GAME_STATE = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    LEVELUP: 'LEVELUP',
    GAMEOVER: 'GAMEOVER'
};

export const FOOD_DROP_CHANCE = 0.05;
export const FOOD_DROP_VALUE = 20;

export class Game {
    constructor(canvas, input) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = input;
        this.state = GAME_STATE.START;
        
        this.camera = { x: 0, y: 0 };
        this.shakeTime = 0;
        this.shakeIntensity = 0;
        
        this.player = null;
        this.weapon = null;
        this.spawner = null;
        
        this.enemies = [];
        this.projectiles = [];
        this.xpGems = [];
        
        this.gridSize = 200;
        this.grid = new Map();
        
        this.elapsedTime = 0;
        this.killCount = 0;
        
        // Cache DOM elements to avoid repetitive lookups
        this.dom = {
            hpBar: document.getElementById('hp-bar'),
            xpBar: document.getElementById('xp-bar'),
            level: document.getElementById('level-display'),
            time: document.getElementById('time-display'),
            kills: document.getElementById('kill-display'),
            hud: document.getElementById('hud'),
            startScreen: document.getElementById('start-screen'),
            gameoverScreen: document.getElementById('gameover-screen'),
            pauseScreen: document.getElementById('pause-screen'),
            levelupScreen: document.getElementById('levelup-screen'),
            upgradeOptions: document.getElementById('upgrade-options'),
            finalStats: document.getElementById('final-stats')
        };
        
        this.lastHUDUpdateValues = {
            hp: -1,
            xp: -1,
            level: -1,
            time: '',
            kills: -1
        };

        this.setupUI();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setupUI() {
        document.getElementById('start-button').onclick = () => this.start();
        document.getElementById('resume-button').onclick = () => this.resume();
        document.getElementById('restart-button').onclick = () => this.start();
        document.getElementById('restart-pause-button').onclick = () => this.start();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.input) {
            this.input.destroy();
        }
        this.input = new Input();
        
        this.player = new Player(0, 0);
        this.player.onLevelUp = () => this.handleLevelUp();
        
        this.weapon = new Weapon(this.player);
        this.spawner = new EnemySpawner(this);
        this.enemies = [];
        this.projectiles = [];
        this.xpGems = [];
        this.elapsedTime = 0;
        this.killCount = 0;
        
        this.state = GAME_STATE.PLAYING;
        
        // Hide screens
        this.dom.startScreen.classList.add('hidden');
        this.dom.gameoverScreen.classList.add('hidden');
        this.dom.pauseScreen.classList.add('hidden');
        this.dom.levelupScreen.classList.add('hidden');
        this.dom.hud.classList.remove('hidden');
        
        this.updateHUD(true);
    }

    resume() {
        this.state = GAME_STATE.PLAYING;
        this.dom.pauseScreen.classList.add('hidden');
    }

    pause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.dom.pauseScreen.classList.remove('hidden');
        }
    }

    handleLevelUp() {
        this.state = GAME_STATE.LEVELUP;
        this.dom.levelupScreen.classList.remove('hidden');
        this.showUpgradeOptions();
    }

    showUpgradeOptions() {
        const optionsContainer = this.dom.upgradeOptions;
        optionsContainer.innerHTML = '';
        
        const upgrades = [
            { type: 'damage', name: 'Damage +10' },
            { type: 'fireRate', name: 'Fire Rate +15%' },
            { type: 'projectileCount', name: '+1 Projectile' },
            { type: 'projectileSpeed', name: 'Projectile Speed +20%' }
        ];

        // Pick 3 random
        const shuffled = shuffle([...upgrades]);
        const selected = shuffled.slice(0, 3);

        selected.forEach(upgrade => {
            const btn = document.createElement('div');
            btn.className = 'upgrade-option';
            btn.innerText = upgrade.name;
            btn.onclick = () => {
                this.weapon.applyUpgrade(upgrade.type);
                this.state = GAME_STATE.PLAYING;
                this.dom.levelupScreen.classList.add('hidden');
            };
            optionsContainer.appendChild(btn);
        });
    }

    update(deltaTime, deltaTimeFactor) {
        if (this.state !== GAME_STATE.PLAYING) return;

        this.elapsedTime += deltaTime / 1000;
        
        // Update entities
        if (!this.player || !this.weapon || !this.spawner) return;

        this.player.update(this.input, deltaTime, deltaTimeFactor);
        this.weapon.update(deltaTime, this.enemies, this.projectiles, deltaTimeFactor);
        this.spawner.update(deltaTime);
        
        this.enemies.forEach(enemy => enemy.update(this.player, deltaTime, deltaTimeFactor));
        this.projectiles.forEach(proj => proj.update(deltaTime, deltaTimeFactor));
        this.xpGems.forEach(gem => gem.update(this.player, deltaTime, deltaTimeFactor));
        
        // Collision Detection
        this.handleCollisions();
        
        // Cleanup
        // Player death is handled by the state change to GAMEOVER. 
        // We use isDead flag rather than toRemove because Player is a persistent entity 
        // managed throughout the entire game session.
        this.enemies = this.enemies.filter(enemy => !enemy.toRemove);
        this.projectiles = this.projectiles.filter(proj => !proj.toRemove);
        this.xpGems = this.xpGems.filter(gem => !gem.toRemove);
        
        // Camera follow
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        // Apply shake
        if (this.shakeTime > 0) {
            this.shakeTime -= deltaTime / 1000;
            this.camera.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.y += (Math.random() - 0.5) * this.shakeIntensity;
        }
        
        // Check game over
        if (this.player.isDead) {
            this.state = GAME_STATE.GAMEOVER;
            this.showGameOver();
        }

        this.updateHUD();
    }

    shake(duration, intensity) {
        this.shakeTime = duration;
        this.shakeIntensity = intensity;
    }

    handleCollisions() {
        // Spatial partitioning (simple grid broad-phase)
        this.grid.clear();

        const getGridKey = (x, y) => {
            const gx = Math.floor(x / this.gridSize);
            const gy = Math.floor(y / this.gridSize);
            return `${gx},${gy}`;
        };

        const addToGrid = (obj, type) => {
            const key = getGridKey(obj.x, obj.y);
            if (!this.grid.has(key)) this.grid.set(key, { enemies: [], projectiles: [], player: null });
            const cell = this.grid.get(key);
            if (type === 'enemy') cell.enemies.push(obj);
            else if (type === 'projectile') cell.projectiles.push(obj);
            else if (type === 'player') cell.player = obj;
        };

        // Add entities to grid
        this.enemies.forEach(e => addToGrid(e, 'enemy'));
        this.projectiles.forEach(p => addToGrid(p, 'projectile'));
        addToGrid(this.player, 'player');

        // Projectile vs Enemy
        this.projectiles.forEach(proj => {
            if (proj.toRemove) return;
            
            const gx = Math.floor(proj.x / this.gridSize);
            const gy = Math.floor(proj.y / this.gridSize);

            // Check surrounding cells
            for (let x = gx - 1; x <= gx + 1; x++) {
                for (let y = gy - 1; y <= gy + 1; y++) {
                    const cell = this.grid.get(`${x},${y}`);
                    if (!cell) continue;

                    cell.enemies.forEach(enemy => {
                        if (enemy.toRemove || proj.toRemove) return;
                        if (checkCircleCollision(proj, enemy)) {
                            enemy.takeDamage(proj.damage);
                            proj.toRemove = true;
                            if (enemy.toRemove) {
                                this.killCount++;
                                this.xpGems.push(new XPGem(enemy.x, enemy.y, enemy.xpDrop));
                                
                                // 5% chance of food drop
                                if (Math.random() < FOOD_DROP_CHANCE) {
                                    this.xpGems.push(new XPGem(enemy.x, enemy.y, FOOD_DROP_VALUE, GEM_TYPE.FOOD));
                                }
                            }
                        }
                    });
                }
            }
        });

        // Enemy vs Player
        const pgx = Math.floor(this.player.x / this.gridSize);
        const pgy = Math.floor(this.player.y / this.gridSize);

        for (let x = pgx - 1; x <= pgx + 1; x++) {
            for (let y = pgy - 1; y <= pgy + 1; y++) {
                const cell = this.grid.get(`${x},${y}`);
                if (!cell) continue;

                cell.enemies.forEach(enemy => {
                    if (enemy.toRemove) return;
                    if (checkCircleCollision(enemy, this.player)) {
                        if (this.player.invincibilityTime <= 0) {
                            this.player.takeDamage(enemy.damage);
                            this.shake(0.2, 10);
                        }
                    }
                });
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.player) return;

        // Draw background (grid)
        this.drawBackground();

        // Culling bounds
        const padding = 100;
        const bounds = {
            left: this.camera.x - padding,
            right: this.camera.x + this.canvas.width + padding,
            top: this.camera.y - padding,
            bottom: this.camera.y + this.canvas.height + padding
        };

        const isVisible = (obj) => {
            return obj.x > bounds.left && obj.x < bounds.right &&
                   obj.y > bounds.top && obj.y < bounds.bottom;
        };

        // Draw entities (render order: gems -> enemies -> projectiles -> player)
        this.xpGems.forEach(gem => {
            if (isVisible(gem)) gem.draw(this.ctx, this.camera);
        });
        this.enemies.forEach(enemy => {
            if (isVisible(enemy)) enemy.draw(this.ctx, this.camera);
        });
        this.projectiles.forEach(proj => {
            if (isVisible(proj)) proj.draw(this.ctx, this.camera);
        });
        this.player.draw(this.ctx, this.camera);
    }

    drawBackground() {
        const ctx = this.ctx;
        const gridSize = 100;
        const offsetX = -this.camera.x % gridSize;
        const offsetY = -this.camera.y % gridSize;

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    updateHUD(force = false) {
        if (!this.player) return;
        
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        if (force || this.lastHUDUpdateValues.hp !== hpPercent) {
            this.dom.hpBar.style.width = `${hpPercent}%`;
            this.lastHUDUpdateValues.hp = hpPercent;
        }

        const xpPercent = (this.player.xp / this.player.xpToNextLevel) * 100;
        if (force || this.lastHUDUpdateValues.xp !== xpPercent) {
            this.dom.xpBar.style.width = `${xpPercent}%`;
            this.lastHUDUpdateValues.xp = xpPercent;
        }

        if (force || this.lastHUDUpdateValues.level !== this.player.level) {
            this.dom.level.innerText = `Level: ${this.player.level}`;
            this.lastHUDUpdateValues.level = this.player.level;
        }

        const formattedTime = formatTime(this.elapsedTime);
        if (force || this.lastHUDUpdateValues.time !== formattedTime) {
            this.dom.time.innerText = formattedTime;
            this.lastHUDUpdateValues.time = formattedTime;
        }

        if (force || this.lastHUDUpdateValues.kills !== this.killCount) {
            this.dom.kills.innerText = `Kills: ${this.killCount}`;
            this.lastHUDUpdateValues.kills = this.killCount;
        }
    }

    showGameOver() {
        this.dom.hud.classList.add('hidden');
        this.dom.gameoverScreen.classList.remove('hidden');
        this.dom.finalStats.innerHTML = `
            <p>Time Survived: ${formatTime(this.elapsedTime)}</p>
            <p>Enemies Defeated: ${this.killCount}</p>
            <p>Level Reached: ${this.player.level}</p>
        `;
    }
}
