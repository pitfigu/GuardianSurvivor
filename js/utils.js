// js/utils.js - helper functions

// Safe way to play sounds
function playSound(scene, key, config = {}) {
    if (scene && scene.sound && scene.cache.audio.exists(key)) {
        return scene.sound.play(key, config);
    }
    return null;
}

// Safe way to check if an object exists and has a method
function canCall(obj, method) {
    return obj && typeof obj[method] === 'function';
}

// Log errors without crashing
function safeLog(message, obj) {
    try {
        console.log(message, obj);
    } catch (e) {
        // Silent catch
    }
}