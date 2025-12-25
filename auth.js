// Add these functions to auth.js

/**
 * Check if device is mobile
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Optimize localStorage operations for mobile
 */
function optimizedLocalStorageSet(key, value) {
    try {
        // Mobile browsers have smaller localStorage limits
        const maxSize = isMobileDevice() ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB mobile, 5MB desktop
        
        if (JSON.stringify(value).length > maxSize) {
            console.warn(`Data too large for mobile: ${key}`);
            
            // For large scores data on mobile, compress or trim
            if (key === 'gyaruGamesUsers') {
                const compressedUsers = value.map(user => {
                    // Remove unnecessary metadata for mobile
                    const { createdAt, lastLogin, ...essentialData } = user;
                    return essentialData;
                });
                localStorage.setItem(key, JSON.stringify(compressedUsers));
                return true;
            }
        }
        
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('LocalStorage error on mobile:', error);
        
        // Fallback for mobile storage issues
        if (error.name === 'QuotaExceededError') {
            // Clear old backup data
            const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('gyaruGamesBackup_'));
            if (backupKeys.length > 1) {
                backupKeys.slice(0, -1).forEach(k => localStorage.removeItem(k));
            }
            
            // Try again
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }
}

/**
 * Mobile-optimized session management
 */
function initializeMobileSession() {
    if (!isMobileDevice()) return;
    
    // Reduce session data size for mobile
    const currentUser = getCurrentSession();
    if (currentUser && !currentUser.isGuest) {
        // Store minimal session data
        const minimalSession = {
            username: currentUser.username,
            timestamp: Date.now()
        };
        sessionStorage.setItem('mobileSession', JSON.stringify(minimalSession));
    }
    
    // Optimize for mobile memory constraints
    if (performance && performance.memory) {
        const usedMemory = performance.memory.usedJSHeapSize;
        const totalMemory = performance.memory.totalJSHeapSize;
        
        if (usedMemory / totalMemory > 0.7) {
            // Memory is getting high on mobile
            console.log('Mobile memory high, cleaning up...');
            
            // Clear guest scores first
            if (localStorage.getItem('guestScores')) {
                localStorage.removeItem('guestScores');
            }
        }
    }
}