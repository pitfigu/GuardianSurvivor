const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1024,
    height: 768,
    backgroundColor: '#111133',
    dom: {
        createContainer: true
    },
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
    playerSpeed: 180,
    playerHealth: 100,
    baseEnemySpawnRate: 2000,      // ms between enemy spawns initially
    minEnemySpawnRate: 800,        // Increased minimum time between spawns (was 500)
    difficultyScaling: 0.985,      // More gradual scaling (was 0.98)
    baseEnemyCap: 30,              // Base enemy cap (was 50)
    enemyCapPerLevel: 3,           // Extra enemies allowed per player level 
    xpToLevelUp: 10,
    xpScaling: 1.35,               // Reduced scaling (was 1.4)
    enemyDamage: {
        basic: 10,
        fast: 5,                   // Lower damage for fast enemies
        tank: 20                   // Higher damage for tanks
    },
    weaponDamageScaling: 1.2,      // Weapons get 20% stronger each difficulty level
    restPeriodFrequency: 5,        // Every 5 difficulty levels
    restPeriodDuration: 15000,     // 15 seconds
    invulnerabilityTime: 500,      // ms of invulnerability after taking damage
    enemyCooldownTime: 1000        // ms before same enemy can damage again
};

// Global game state
const GAME_STATE = {
    username: localStorage.getItem('username') || 'Player',
    highScore: parseInt(localStorage.getItem('highScore') || '0'),
    leaderboardService: null
};

// Initialize after the game starts
window.addEventListener('DOMContentLoaded', () => {
    GAME_STATE.leaderboardService = new LeaderboardService();
});

// Update the saveHighScore function to use the service
function saveHighScore(score, time, level) {
    try {
        if (GAME_STATE.leaderboardService) {
            return GAME_STATE.leaderboardService.saveScore(
                GAME_STATE.username,
                score,
                time,
                level
            );
        } else {
            // Fallback to previous implementation
            const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

            // Add new score
            highScores.push({
                name: GAME_STATE.username,
                score: score,
                time: time,
                level: level,
                date: new Date().toISOString()
            });

            // Sort and limit
            const sortedScores = highScores
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            localStorage.setItem('highScores', JSON.stringify(sortedScores));

            if (score > GAME_STATE.highScore) {
                GAME_STATE.highScore = score;
                localStorage.setItem('highScore', score);
            }

            return null;
        }
    } catch (e) {
        console.error("Error saving high score:", e);
        return null;
    }
}

// Helper function to play sounds safely
function playSound(scene, key, config = {}) {
    if (scene && scene.sound && scene.cache.audio.exists(key)) {
        return scene.sound.play(key, config);
    }
    return null;
}

