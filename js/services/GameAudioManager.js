class GameAudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicTracks = {};
        this.currentMusic = null;
        this.volume = parseFloat(localStorage.getItem('gameVolume') || '0.5');
        this.muted = localStorage.getItem('gameMuted') === 'true';

        // Initialize audio settings
        if (this.scene.sound) {
            this.scene.sound.setMute(this.muted);
            this.scene.sound.setVolume(this.volume);
        }
    }

    preloadSounds(soundConfig) {
        if (!this.scene || !this.scene.load) return;

        // Load all defined sounds
        for (const key in soundConfig) {
            if (soundConfig[key].file) {
                this.scene.load.audio(key, soundConfig[key].file);
            }
        }
    }

    play(key, config = {}) {
        if (this.scene && this.scene.sound && this.scene.cache.audio.exists(key)) {
            // Get default settings for this sound
            const defaultConfig = this.getDefaultConfig(key);

            // Merge with provided config
            const finalConfig = { ...defaultConfig, ...config };

            // Play the sound
            return this.scene.sound.play(key, finalConfig);
        }
        return null;
    }

    getDefaultConfig(key) {
        // Define default settings for different sound types
        const defaults = {
            hit: { volume: 0.3, rate: 1.0 },
            shoot: { volume: 0.2, rate: 1.2 },
            pickup: { volume: 0.2, rate: 1.0 },
            enemyDeath: { volume: 0.4, rate: 1.0 },
            playerHurt: { volume: 0.4, rate: 1.0 },
            levelUp: { volume: 0.7, rate: 1.0 },
            select: { volume: 0.5, rate: 1.0 },
            gameOver: { volume: 0.7, rate: 1.0 }
        };

        return defaults[key] || { volume: 0.5, rate: 1.0 };
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('gameMuted', this.muted.toString());

        if (this.scene && this.scene.sound) {
            this.scene.sound.setMute(this.muted);
        }

        return this.muted;
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        localStorage.setItem('gameVolume', this.volume.toString());

        if (this.scene && this.scene.sound) {
            this.scene.sound.setVolume(this.volume);
        }

        return this.volume;
    }
}