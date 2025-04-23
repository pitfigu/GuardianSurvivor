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
    baseEnemySpawnRate: 2000,
    minEnemySpawnRate: 500,
    difficultyScaling: 0.98,
    maxActiveEnemies: 50,
    xpToLevelUp: 10,
    xpScaling: 1.4,
    enemyDamage: {
        basic: 5,
        fast: 3,
        tank: 10
    }
};

// Global game state
const GAME_STATE = {
    username: localStorage.getItem('username') || 'Player',
    highScore: parseInt(localStorage.getItem('highScore') || '0')
};

// Function to save high score with username
function saveHighScore(score, time, level) {
    try {
        // Get existing high scores or initialize empty array
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        // Add new score
        highScores.push({
            name: GAME_STATE.username,
            score: score,
            time: time,
            level: level,
            date: new Date().toISOString()
        });

        // Sort by score (highest first) and keep only top 10
        const sortedScores = highScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // Save back to local storage
        localStorage.setItem('highScores', JSON.stringify(sortedScores));

        // Update single high score if needed
        if (score > GAME_STATE.highScore) {
            GAME_STATE.highScore = score;
            localStorage.setItem('highScore', score);
        }
    } catch (e) {
        console.error("Error saving high score:", e);
    }
}

// Helper function to play sounds safely
function playSound(scene, key, config = {}) {
    if (scene && scene.sound && scene.cache.audio.exists(key)) {
        return scene.sound.play(key, config);
    }
    return null;
}

