// Gyaru Games Collection - Fixes and Patches
// Version 1.1 - Enhanced Error Handling

/**
 * Apply all necessary fixes to the system
 */
function applySystemFixes() {
    console.log('🔧 Applying system fixes...');
    
    let fixesApplied = [];
    
    try {
        // Fix 1: Ensure users array exists
        if (!localStorage.getItem('gyaruGamesUsers')) {
            localStorage.setItem('gyaruGamesUsers', JSON.stringify([]));
            fixesApplied.push('Created missing users array');
        }
        
        // Fix 2: Ensure guest mode is properly set
        const currentUser = localStorage.getItem('gyaruGamesCurrentUser');
        const guestMode = localStorage.getItem('guestMode');
        
        if (guestMode === 'true' && (!currentUser || currentUser === 'Guest')) {
            localStorage.setItem('gyaruGamesCurrentUser', 'Guest');
            fixesApplied.push('Fixed guest mode session');
        }
        
        // Fix 3: Fix user scores structure if needed
        const users = JSON.parse(localStorage.getItem('gyaruGamesUsers')) || [];
        let usersFixed = 0;
        
        users.forEach((user, index) => {
            let userFixed = false;
            
            // Ensure user has all required properties
            if (!user.id) {
                user.id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                userFixed = true;
            }
            
            if (!user.createdAt) {
                user.createdAt = new Date().toISOString();
                userFixed = true;
            }
            
            if (!user.scores) {
                user.scores = createDefaultScores();
                userFixed = true;
            } else {
                // Ensure all game score structures exist
                const defaultScores = createDefaultScores();
                Object.keys(defaultScores).forEach(game => {
                    if (game !== 'achievements' && game !== 'lastPlayed') {
                        if (!user.scores[game]) {
                            user.scores[game] = defaultScores[game];
                            userFixed = true;
                        }
                    }
                });
                
                // Ensure lastPlayed exists
                if (!user.scores.lastPlayed) {
                    user.scores.lastPlayed = defaultScores.lastPlayed;
                    userFixed = true;
                }
            }
            
            if (userFixed) {
                usersFixed++;
                users[index] = user;
            }
        });
        
        if (usersFixed > 0) {
            localStorage.setItem('gyaruGamesUsers', JSON.stringify(users));
            fixesApplied.push(`Fixed data structure for ${usersFixed} users`);
        }
        
        // Fix 4: Clean up invalid sessions
        if (currentUser && currentUser !== 'Guest') {
            const userExists = users.some(u => u.username === currentUser);
            if (!userExists) {
                localStorage.removeItem('gyaruGamesCurrentUser');
                localStorage.setItem('guestMode', 'false');
                fixesApplied.push('Cleaned invalid session');
            }
        }
        
        // Fix 5: Migrate old score format
        let scoresMigrated = 0;
        users.forEach((user, index) => {
            if (user.scores) {
                // Migrate old sudoku format
                if (user.scores.sudoku && !user.scores.sudoku.totalGames) {
                    const easy = user.scores.sudoku.easy || {};
                    const medium = user.scores.sudoku.medium || {};
                    const hard = user.scores.sudoku.hard || {};
                    
                    user.scores.sudoku.totalGames = (easy.completed || 0) + (medium.completed || 0) + (hard.completed || 0);
                    user.scores.sudoku.totalWins = user.scores.sudoku.totalGames;
                    scoresMigrated++;
                    users[index] = user;
                }
            }
        });
        
        if (scoresMigrated > 0) {
            localStorage.setItem('gyaruGamesUsers', JSON.stringify(users));
            fixesApplied.push(`Migrated scores for ${scoresMigrated} users`);
        }
        
        // Fix 6: Clean up guest scores if they exist from old system
        const guestScores = localStorage.getItem('guestScores');
        if (guestScores) {
            try {
                JSON.parse(guestScores);
            } catch {
                localStorage.removeItem('guestScores');
                fixesApplied.push('Cleaned corrupted guest scores');
            }
        }
        
        // Log results
        if (fixesApplied.length > 0) {
            console.log('✅ Applied fixes:', fixesApplied);
        } else {
            console.log('✅ No fixes needed');
        }
        
        return { success: true, fixes: fixesApplied };
        
    } catch (error) {
        console.error('❌ System fixes failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Repair a specific user's data
 */
function repairUserData(username) {
    try {
        const users = JSON.parse(localStorage.getItem('gyaruGamesUsers')) || [];
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            console.error(`User ${username} not found`);
            return { success: false, message: 'User not found' };
        }
        
        const defaultScores = createDefaultScores();
        const user = users[userIndex];
        
        // Backup original scores
        const originalScores = JSON.parse(JSON.stringify(user.scores || {}));
        
        // Initialize scores if missing
        user.scores = user.scores || {};
        
        // Repair game scores
        Object.keys(defaultScores).forEach(key => {
            if (key === 'lastPlayed' || key === 'achievements') {
                if (!user.scores[key]) {
                    user.scores[key] = defaultScores[key];
                }
            } else {
                // Game scores
                if (!user.scores[key]) {
                    user.scores[key] = defaultScores[key];
                } else {
                    // Merge with defaults, preserving user data
                    user.scores[key] = { ...defaultScores[key], ...user.scores[key] };
                }
            }
        });
        
        // Ensure required properties
        if (!user.id) user.id = 'repaired_' + Date.now();
        if (!user.createdAt) user.createdAt = new Date().toISOString();
        if (!user.lastLogin) user.lastLogin = new Date().toISOString();
        
        // Save repaired data
        users[userIndex] = user;
        localStorage.setItem('gyaruGamesUsers', JSON.stringify(users));
        
        console.log(`✅ Repaired data for user: ${username}`);
        return { 
            success: true, 
            message: `User data repaired for ${username}`,
            original: originalScores,
            repaired: user.scores
        };
        
    } catch (error) {
        console.error('Repair user data error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Export system diagnostics
 */
function getSystemDiagnostics() {
    try {
        const users = JSON.parse(localStorage.getItem('gyaruGamesUsers')) || [];
        const currentUser = getCurrentSession ? getCurrentSession() : null;
        
        const diagnostics = {
            timestamp: new Date().toISOString(),
            localStorageSize: JSON.stringify(localStorage).length,
            totalUsers: users.length,
            currentUser: currentUser ? {
                username: currentUser.username,
                isGuest: currentUser.isGuest,
                hasScores: !!currentUser.scores
            } : null,
            users: users.map(user => ({
                username: user.username,
                hasScores: !!user.scores,
                gamesWithData: user.scores ? Object.keys(user.scores).filter(game => {
                    if (game === 'lastPlayed' || game === 'achievements') return false;
                    const gameData = user.scores[game];
                    return gameData && (
                        gameData.totalGames > 0 || 
                        gameData.gamesPlayed > 0 || 
                        gameData.wins > 0
                    );
                }) : []
            })),
            issues: []
        };
        
        // Check for common issues
        users.forEach(user => {
            if (!user.scores) {
                diagnostics.issues.push(`User ${user.username} has no scores`);
            }
            
            if (!user.id || !user.createdAt) {
                diagnostics.issues.push(`User ${user.username} missing metadata`);
            }
        });
        
        return diagnostics;
        
    } catch (error) {
        console.error('System diagnostics error:', error);
        return {
            timestamp: new Date().toISOString(),
            error: error.message,
            issues: ['Failed to generate diagnostics']
        };
    }
}

/**
 * Reset a specific game's scores for all users
 */
function resetAllGameScores(game) {
    try {
        if (!['sudoku', 'rps', 'chess', 'checkers'].includes(game)) {
            console.error(`Invalid game: ${game}`);
            return { success: false, message: 'Invalid game specified' };
        }
        
        const users = JSON.parse(localStorage.getItem('gyaruGamesUsers')) || [];
        const defaultScores = createDefaultScores();
        let usersReset = 0;
        
        users.forEach((user, index) => {
            if (user.scores && user.scores[game]) {
                user.scores[game] = defaultScores[game];
                users[index] = user;
                usersReset++;
            }
        });
        
        if (usersReset > 0) {
            localStorage.setItem('gyaruGamesUsers', JSON.stringify(users));
        }
        
        console.log(`✅ Reset ${game} scores for ${usersReset} users`);
        return { success: true, usersReset: usersReset };
        
    } catch (error) {
        console.error('Reset all game scores error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Backup all user data
 */
function backupUserData() {
    try {
        const users = JSON.parse(localStorage.getItem('gyaruGamesUsers')) || [];
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.1',
            users: users,
            totalUsers: users.length
        };
        
        const backupStr = JSON.stringify(backup, null, 2);
        const backupKey = `gyaruGamesBackup_${Date.now()}`;
        localStorage.setItem(backupKey, backupStr);
        
        // Keep only last 5 backups
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(key => key.startsWith('gyaruGamesBackup_')).sort();
        
        if (backupKeys.length > 5) {
            for (let i = 0; i < backupKeys.length - 5; i++) {
                localStorage.removeItem(backupKeys[i]);
            }
        }
        
        console.log('✅ Created backup:', backupKey);
        return { success: true, backupKey: backupKey, userCount: users.length };
        
    } catch (error) {
        console.error('Backup error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Restore from backup
 */
function restoreFromBackup(backupKey) {
    try {
        const backupStr = localStorage.getItem(backupKey);
        if (!backupStr) {
            return { success: false, message: 'Backup not found' };
        }
        
        const backup = JSON.parse(backupStr);
        
        if (!backup.users || !Array.isArray(backup.users)) {
            return { success: false, message: 'Invalid backup format' };
        }
        
        // Create a backup before restoring
        backupUserData();
        
        // Restore users
        localStorage.setItem('gyaruGamesUsers', JSON.stringify(backup.users));
        
        console.log(`✅ Restored backup: ${backupKey} (${backup.users.length} users)`);
        return { success: true, usersRestored: backup.users.length };
        
    } catch (error) {
        console.error('Restore error:', error);
        return { success: false, error: error.message };
    }
}

// Auto-apply fixes when loaded
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(applySystemFixes, 500);
        });
    } else {
        setTimeout(applySystemFixes, 500);
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applySystemFixes,
        repairUserData,
        getSystemDiagnostics,
        resetAllGameScores,
        backupUserData,
        restoreFromBackup
    };
}