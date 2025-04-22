// js/game.js
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1024,    // Increased from 800
    height: 768,    // Increased from 600
    backgroundColor: '#111133', // Dark blue background
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, MainScene, GameOverScene]
};

const game = new Phaser.Game(config);

// Global game settings
const GAME_SETTINGS = {
    playerSpeed: 180,         // Slightly faster player
    playerHealth: 100,
    baseEnemySpawnRate: 2000, // ms
    minEnemySpawnRate: 500,   // Spawning won't get faster than this
    difficultyScaling: 0.98,  // More gradual difficulty increase (was 0.95)
    maxActiveEnemies: 50,     // Cap on enemies to prevent overwhelming the player
    xpToLevelUp: 10,
    xpScaling: 1.4,           // Slightly reduced XP scaling (was 1.5)
    enemyDamage: {            // Standardize enemy damage
        basic: 5,
        fast: 3,
        tank: 10
    }
};

function playSound(scene, key, config = {}) {
    // Only play the sound if it exists in the cache
    if (scene.sound && scene.cache.audio.exists(key)) {
        scene.sound.play(key, config);
    }
}

// Global game state
const GAME_STATE = {
    highScore: localStorage.getItem('highScore') || 0
};