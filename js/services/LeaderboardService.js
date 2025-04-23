// Add new file: js/services/LeaderboardService.js
class LeaderboardService {
    constructor() {
        this.localScores = this.getLocalScores();
        this.syncInterval = null;
        this.onScoreUpdate = null;

        // Initialize online sharing if possible
        this.initOnlineSharing();
    }

    initOnlineSharing() {
        try {
            // Use localStorage as persistence
            if (!localStorage.getItem('globalHighScores')) {
                localStorage.setItem('globalHighScores', JSON.stringify([]));
            }

            // Add firebase integration code here if available
            // For now, we'll implement a simplified sharing approach using URL parameters

            // Check for shared scores in URL
            this.checkForSharedScores();

            // Set up periodic sync
            this.syncInterval = setInterval(() => this.syncScores(), 30000);
        } catch (e) {
            console.error("Failed to initialize online sharing:", e);
        }
    }

    checkForSharedScores() {
        try {
            // Get scores from URL hash if present
            const hash = window.location.hash;
            if (hash && hash.startsWith('#scores=')) {
                const encodedScores = hash.substring(8);
                const decodedScores = JSON.parse(decodeURIComponent(encodedScores));

                // Merge with existing scores
                this.mergeScores(decodedScores);

                // Clear hash after processing
                window.location.hash = '';
            }
        } catch (e) {
            console.error("Error processing shared scores:", e);
        }
    }

    saveScore(name, score, time, level) {
        // Create score object
        const newScore = {
            id: this.generateUniqueId(),
            name: name,
            score: score,
            time: time,
            level: level,
            date: new Date().toISOString(),
            device: this.getDeviceId()
        };

        // Add to local scores
        this.localScores.push(newScore);

        // Sort & limit
        this.localScores.sort((a, b) => b.score - a.score);
        this.localScores = this.localScores.slice(0, 100); // Keep top 100

        // Save locally
        localStorage.setItem('highScores', JSON.stringify(this.localScores));

        // Try to save to global scores
        this.addToGlobalScores(newScore);

        // Update single high score if needed
        const currentHighScore = parseInt(localStorage.getItem('highScore') || '0');
        if (score > currentHighScore) {
            localStorage.setItem('highScore', score.toString());
        }

        // Notify listeners
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.getGlobalScores());
        }

        return newScore;
    }

    getLocalScores() {
        try {
            return JSON.parse(localStorage.getItem('highScores')) || [];
        } catch (e) {
            console.error("Error loading local scores:", e);
            return [];
        }
    }

    getGlobalScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('globalHighScores')) || [];
            return scores.sort((a, b) => b.score - a.score);
        } catch (e) {
            console.error("Error loading global scores:", e);
            return [];
        }
    }

    addToGlobalScores(score) {
        try {
            const globalScores = this.getGlobalScores();

            // Check if score is already in global scores (by ID)
            if (!globalScores.some(s => s.id === score.id)) {
                globalScores.push(score);
                globalScores.sort((a, b) => b.score - a.score);

                // Keep top 100
                const limitedScores = globalScores.slice(0, 100);
                localStorage.setItem('globalHighScores', JSON.stringify(limitedScores));
            }
        } catch (e) {
            console.error("Error adding to global scores:", e);
        }
    }

    mergeScores(newScores) {
        try {
            if (!Array.isArray(newScores)) return;

            const globalScores = this.getGlobalScores();
            let updated = false;

            // Add each new score if unique
            newScores.forEach(score => {
                if (!globalScores.some(s => s.id === score.id)) {
                    globalScores.push(score);
                    updated = true;
                }
            });

            if (updated) {
                // Sort, limit and save
                globalScores.sort((a, b) => b.score - a.score);
                const limitedScores = globalScores.slice(0, 100);
                localStorage.setItem('globalHighScores', JSON.stringify(limitedScores));

                // Notify listeners
                if (this.onScoreUpdate) {
                    this.onScoreUpdate(limitedScores);
                }
            }
        } catch (e) {
            console.error("Error merging scores:", e);
        }
    }

    syncScores() {
        // Here we would implement real online sync if we had a backend
        // For now, we'll use the URL sharing approach
        this.generateShareableURL();
    }

    generateShareableURL() {
        try {
            const scores = this.getGlobalScores();
            if (scores.length === 0) return null;

            const encodedScores = encodeURIComponent(JSON.stringify(scores));
            const baseUrl = window.location.origin + window.location.pathname;

            return `${baseUrl}#scores=${encodedScores}`;
        } catch (e) {
            console.error("Error generating shareable URL:", e);
            return null;
        }
    }

    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }

    getDeviceId() {
        // Get or create device ID for tracking origin of scores
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + this.generateUniqueId();
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }
}