# Vampire Survivors Clone - MVP Implementation Plan

## Project Overview

A browser-based clone of Vampire Survivors featuring core auto-battler mechanics: automatic weapon firing, wave-based enemy spawning, XP-based progression, and survival gameplay.

**Target**: Playable MVP with core game loop.

---

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Rendering**: HTML5 Canvas 2D API
- **Project Setup**: Single HTML file with module imports, no build tools
- **Storage**: LocalStorage for save data (if implementing persistence)
- **Deployment**: Static hosting (GitHub Pages, Netlify, or Vercel)

**Rationale**:
- No build step or dependencies
- Full control over game loop and rendering
- Can migrate to framework later if needed

---

## Core Game Mechanics (MVP)

### 1. Player System
- **Movement**: WASD or Arrow keys, 8-directional movement
- **Visual**: Colored circle (e.g., blue, radius 20px)
- **Stats**:
  - HP: Starting value (e.g., 100)
  - Movement Speed: Pixels per frame
  - No advanced stats in MVP

### 2. Weapon System
- **Starting Weapon**: Auto-firing projectile shooter
  - Fires in nearest enemy direction (or random if no enemies)
  - Projectile visual: Small colored circle (e.g., yellow)
  - Projectile behavior: Travels in straight line, despawns at screen edge or on hit
- **Weapon Stats**:
  - Damage: Damage dealt per hit
  - Fire Rate: Shots per second
  - Projectile Speed: Pixels per frame
  - Projectile Count: Number of simultaneous projectiles (starts at 1)
  - Projectile Size: Visual size and hitbox radius
- **Upgrade System**: On level up, player chooses one weapon stat to improve
  - Damage +10
  - Fire Rate +15%
  - +1 Projectile
  - Projectile Speed +20%

### 3. Enemy System
- **Spawning**:
  - Enemies spawn at random positions outside visible screen
  - Spawn rate increases over time (every 30 seconds, spawn rate multiplies by 1.2)
  - Enemy count cap to prevent performance issues (e.g., max 200 active enemies)
- **Enemy Behavior**:
  - Simple chase AI: Move directly toward player at constant speed
  - Deal damage on collision with player (contact damage)
- **Enemy Types**:
  - **Basic Enemy**:
    - Visual: Red circle, radius 15px
    - HP: 20
    - Speed: 2 pixels/frame
    - Damage: 5
    - XP Drop: 1
- **Enemy Scaling**: After 60 seconds, introduce tougher enemy variant
  - HP multiplied by 1.5
  - Speed increased by 10%
  - Visual: Larger red circle

### 4. Combat System
- **Collision Detection**:
  - Circle-to-circle collision (player, enemies, projectiles)
  - Check distance between centers: `distance < radius1 + radius2`
- **Damage System**:
  - Projectile hits enemy → Deal weapon damage, destroy projectile
  - Enemy touches player → Deal contact damage, apply short invincibility frames (0.5s)
- **Death**:
  - Player: HP ≤ 0 → Game Over screen
  - Enemy: HP ≤ 0 → Drop XP gem, remove from game

### 5. XP and Leveling System
- **XP Gems**:
  - Visual: Green circle, radius 8px
  - Drop at enemy death position
  - Automatically move toward player when within pickup range (e.g., 100px)
  - Collected on contact with player
- **Leveling**:
  - XP required scales: `XP_needed = base * (level ^ 1.5)` (e.g., base = 10)
  - On level up:
    1. Pause game
    2. Show 3 random weapon upgrade options
    3. Player selects one
    4. Resume game
- **Level Cap**: None

### 6. Game Loop and Timing
- **Game Loop**:
  - Use `requestAnimationFrame` for smooth 60 FPS
  - Delta time tracking for frame-independent movement
- **Game States**:
  - `START`: Main menu / start screen
  - `PLAYING`: Active gameplay
  - `PAUSED`: Pause menu
  - `LEVELUP`: Level-up selection screen (game paused)
  - `GAMEOVER`: Death screen with stats
- **Time Tracking**: Track elapsed game time (survival time) for stats

---

## File Structure

```
vampire-survivors-clone/
├── index.html              # Main HTML entry point
├── styles.css              # UI and canvas styling
├── js/
│   ├── main.js            # Game initialization and state management
│   ├── game.js            # Core game loop and update logic
│   ├── renderer.js        # Canvas rendering functions
│   ├── player.js          # Player class and movement
│   ├── weapon.js          # Weapon and projectile classes
│   ├── enemy.js           # Enemy spawning and AI
│   ├── xp.js              # XP gem and leveling system
│   ├── collision.js       # Collision detection utilities
│   ├── input.js           # Keyboard input handling
│   └── utils.js           # Helper functions (distance, random, etc.)
├── PLAN.md                # This file
└── README.md              # Project documentation
```

---

## Implementation Phases

### Phase 1: Core Foundation
**Goal**: Player movement and basic rendering

**Tasks**:
1. Set up project structure (HTML, CSS, JS modules)
2. Create canvas and basic rendering loop (60 FPS with `requestAnimationFrame`)
3. Implement player class with movement (WASD/arrows)
4. Add input handling for keyboard
5. Implement camera tracking (center player on screen)
6. Add basic collision boundary (keep player on screen or allow infinite map)

**Deliverable**: Player circle moves smoothly with keyboard input

---

### Phase 2: Combat System
**Goal**: Implement shooting and enemy interactions

**Tasks**:
1. Implement weapon class with auto-firing projectiles
2. Add projectile movement and lifecycle (travel, timeout, hit)
3. Create enemy class with chase AI
4. Implement enemy spawning at random off-screen positions
5. Add collision detection (projectile-enemy, player-enemy)
6. Implement damage system and enemy death
7. Add invincibility frames for player after taking damage

**Deliverable**: Player auto-shoots enemies that chase and die on hit. Player takes damage from contact

---

### Phase 3: Progression System
**Goal**: XP, leveling, and weapon upgrades

**Tasks**:
1. Implement XP gem drops on enemy death
2. Add XP gem movement toward player (magnetic pickup)
3. Create leveling system with XP requirements
4. Build level-up UI overlay with upgrade choices
5. Implement weapon upgrade logic (damage, fire rate, projectile count, etc.)
6. Add game pause/resume for level-up screen
7. Display player level on UI

**Deliverable**: Player levels up, chooses upgrades, and sees weapon power increase

---

### Phase 4: Game Flow and UI
**Goal**: Menus, game states, and HUD

**Tasks**:
1. Create start screen with "Start Game" button
2. Implement game over screen with stats (survival time, kills, level)
3. Add pause menu with resume/restart options
4. Display HUD (HP bar, XP bar, time survived, level)
5. Implement restart functionality (reset game state)
6. Add visual feedback (damage flash, XP pickup effect)
7. Balance tuning (enemy spawn rates, damage values, XP scaling)

**Deliverable**: Complete game loop from start to game over with UI

---

### Phase 5: Difficulty Scaling and Polish
**Goal**: Progressive difficulty and visual polish

**Tasks**:
1. Implement time-based difficulty scaling
   - Increase enemy spawn rate over time
   - Introduce tougher enemy variants after certain time
   - Scale enemy HP and damage
2. Add enemy count cap to prevent performance issues
3. Optimize rendering (only draw entities near screen)
4. Add visual polish:
   - Screen shake on hit
   - Particle effects for enemy death (optional)
   - Color flashing for damage feedback
5. Implement basic audio system (optional):
   - Background music loop
   - Sound effects (shoot, hit, level up, death)
6. Playtest and balance gameplay

**Deliverable**: Challenging, escalating gameplay with polished feel

---

## Optional Features (Post-MVP)

1. **Multiple Weapons**:
   - Melee weapon (orbiting blade)
   - Area damage weapon (fire circle)
   - Weapon evolution at max level

2. **Character Stats**:
   - Add character-specific upgrades (HP, speed, pickup range)
   - Different starting characters with unique bonuses

3. **Persistent Progression**:
   - Unlock new weapons/characters between runs
   - Save progress to LocalStorage
   - Meta-progression currency

4. **Map and Environment**:
   - Obstacles and walls
   - Environmental hazards
   - Different biomes

5. **Advanced Enemy AI**:
   - Ranged enemies that shoot back
   - Teleporting or charging enemies
   - Boss enemies at time milestones

6. **Power-ups and Pickups**:
   - Temporary buffs (speed boost, invincibility)
   - Health pickups
   - Chests with loot

7. **Visual Upgrades**:
   - Replace shapes with sprite art
   - Animated sprites
   - Parallax background

---

## Key Technical Decisions

### Canvas Rendering Strategy
- **Single canvas**: Draw everything on one canvas layer
- **Rendering order**: Background → XP gems → Enemies → Projectiles → Player → UI
- **Coordinate system**: World coordinates converted to screen coordinates
- **Viewport**: Camera follows player, only render entities near visible area

### Collision Detection
- **Method**: Circle-to-circle distance checks
- **Optimization**: Basic spatial partitioning if performance issues arise
- **Frequency**: Every frame for accuracy

### Entity Management
- **Structure**: Arrays for each entity type (enemies, projectiles, XP gems)
- **Cleanup**: Remove dead entities each frame to prevent memory leaks
- **Pooling**: Not required for MVP

### State Management
- **Global game state object**: Store player, enemies, projectiles, game time, etc.
- **Game state machine**: Enum for game states (START, PLAYING, LEVELUP, GAMEOVER)
- **Update order**: Input → Player → Weapons → Enemies → Projectiles → Collision → XP → Cleanup

### Input Handling
- **Keyboard state object**: Track which keys are currently pressed
- **Event listeners**: `keydown` and `keyup` to update state
- **Movement**: Check input state every frame, update player velocity

---

## Performance Considerations

### Target Performance
- Maintain 60 FPS with:
  - 1 player
  - 100-200 enemies on screen
  - 50-100 projectiles active
  - 50 XP gems

### Optimization Strategies
1. **Limit entity counts**: Cap max enemies, auto-despawn old projectiles
2. **Culling**: Don't update/render entities far off-screen
3. **Reduce collision checks**: Broad-phase collision detection (grid-based)
4. **RequestAnimationFrame**: Use browser's optimized frame timing
5. **Object pooling**: Reuse entity objects instead of creating/destroying

---

## Testing and Balancing

### Playtesting Checklist
- [ ] Player movement feels responsive
- [ ] Weapon auto-firing is satisfying
- [ ] Enemies are visible and threatening
- [ ] Level-ups feel rewarding
- [ ] Game difficulty increases noticeably over time
- [ ] Game over happens at reasonable time (5-15 minutes for first run)
- [ ] No major performance drops or crashes

### Balance Tuning Variables
- Enemy spawn rate and scaling
- Player HP and damage taken
- Weapon damage and fire rate
- XP requirements per level
- Enemy HP and movement speed
- Upgrade effectiveness values

---

## Deployment

### Build Process
- No build step required (vanilla JS)
- Simply upload all files to static hosting

### Hosting Options
- GitHub Pages
- Netlify
- Vercel
- itch.io

---

## Success Criteria for MVP
1. ✅ Player can move around with keyboard
2. ✅ Weapon automatically fires at enemies
3. ✅ Enemies spawn and chase player
4. ✅ Player takes damage and can die
5. ✅ Enemies die and drop XP
6. ✅ Player levels up and chooses upgrades
7. ✅ Weapon gets stronger with upgrades
8. ✅ Game has start screen and game over screen
9. ✅ Difficulty increases over time
10. ✅ Game runs smoothly at 60 FPS

---

## Code Style Guidelines

### Naming Conventions
- **Classes**: PascalCase (`Player`, `Enemy`, `Weapon`)
- **Functions/Variables**: camelCase (`updatePlayer`, `enemySpeed`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ENEMIES`, `BASE_DAMAGE`)

### Code Organization
- One class per file
- Export classes/functions as ES6 modules
- Import only what's needed
- Keep functions small and focused (< 50 lines)

### Comments
- Document complex algorithms
- Explain reasoning not obvious operations
- Use TODO comments for future improvements

---

## Implementation Order

1. Create initial project structure (HTML, CSS, JS files)
2. Set up canvas and basic rendering loop
3. Begin Phase 1 implementation (player movement)
4. Iterate through phases sequentially
5. Playtest and balance after Phase 5
6. Deploy

---

## Technical References

### Collision Detection
- Circle distance formula: `sqrt((x2-x1)^2 + (y2-y1)^2)`
- Circle collision: `distance < radius1 + radius2`

### Game Loop Pattern
- Use `requestAnimationFrame` for frame timing
- Track delta time for frame-independent movement
- Update order: Input → Player → Weapons → Enemies → Projectiles → Collision → XP → Cleanup

### Canvas Rendering
- Single canvas layer
- Clear and redraw each frame
- Render order: Background → XP gems → Enemies → Projectiles → Player → UI
