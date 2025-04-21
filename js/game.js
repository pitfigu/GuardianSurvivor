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
    playerSpeed: 160,
    playerHealth: 100,
    baseEnemySpawnRate: 2000, // ms
    difficultyScaling: 0.95, // Spawn rate multiplier over time
    xpToLevelUp: 10,
    xpScaling: 1.5 // XP needed multiplier per level
};

// Global game state
const GAME_STATE = {
    highScore: localStorage.getItem('highScore') || 0
};