// Difficulty system configuration

export const DIFFICULTY = {
    EASY: 'EASY',
    NORMAL: 'NORMAL',
    HARD: 'HARD'
};

export const DIFFICULTY_CONFIG = {
    [DIFFICULTY.EASY]: {
        name: 'Easy',
        description: 'For players new to the game',
        // Enemy damage multiplier
        enemyDamageMultiplier: 0.75,
        // Enemy health multiplier
        enemyHealthMultiplier: 0.75,
        // Spawn rate multiplier
        spawnRateMultiplier: 0.8,
        // Spawn rate scaling per interval (30s) - lower = slower growth
        spawnScalingMultiplier: 1.15,
        // Food drop chance
        foodDropChance: 0.08
    },
    [DIFFICULTY.NORMAL]: {
        name: 'Normal',
        description: 'Balanced challenge',
        // Enemy damage multiplier
        enemyDamageMultiplier: 1.0,
        // Enemy health multiplier
        enemyHealthMultiplier: 1.0,
        // Spawn rate multiplier
        spawnRateMultiplier: 1.0,
        // Spawn rate scaling per interval (30s)
        spawnScalingMultiplier: 1.2,
        // Food drop chance
        foodDropChance: 0.05
    },
    [DIFFICULTY.HARD]: {
        name: 'Hard',
        description: 'For experienced survivors',
        // Enemy damage multiplier
        enemyDamageMultiplier: 1.5,
        // Enemy health multiplier
        enemyHealthMultiplier: 1.5,
        // Spawn rate multiplier
        spawnRateMultiplier: 1.3,
        // Spawn rate scaling per interval (30s) - higher = faster growth
        spawnScalingMultiplier: 1.25,
        // Food drop chance
        foodDropChance: 0.03
    }
};
