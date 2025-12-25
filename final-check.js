// Final System Integration Check - Enhanced
console.log('=== GYARU GAMES FINAL SYSTEM CHECK v1.2 ===');

/**
 * Comprehensive system health check
 */
function performSystemCheck() {
    const results = {
        passed: [],
        warnings: [],
        errors: [],
        timestamp: new Date().toISOString()
    };
    
    // Check 1: LocalStorage availability
    try {
        if (typeof localStorage !== 'undefined') {
            results.passed.push('localStorage is available');
        } else {
            results.errors.push('localStorage is not available');
        }
    } catch (e) {
        results.errors.push('Failed to access localStorage: ' + e.message);
    }
    
    // Check 2: Required localStorage keys
    const requiredKeys = ['gyaruGamesUsers', 'guestMode'];
    requiredKeys.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            results.passed.push(`LocalStorage key "${key}" exists`);
        } else {
            results.warnings.push(`LocalStorage key "${key}" is missing`);
        }
    });
    
    // Check 3: User data structure
    try {
        const users = JSON.parse(localStorage.getItem('gyaruGamesUsers') || '[]');
        if (Array.isArray(users)) {
            results.passed.push(`User data is valid array (${users.length} users)`);
            
            // Check each user's structure
            users.forEach((user, index) => {
                if (!user.id) {
                    results.warnings.push(`User ${index} (${user.username || 'unknown'}) missing ID`);
                }
                if (!user.scores) {
                    results.warnings.push(`User ${index} (${user.username || 'unknown'}) missing scores`);
                }
            });
        } else {
            results.errors.push('User data is not a valid array');
        }
    } catch (e) {
        results.errors.push('Failed to parse user data: ' + e.message);
    }
    
    // Check 4: Current session
    try {
        const currentUser = getCurrentSession ? getCurrentSession() : null;
        if (currentUser) {
            results.passed.push(`Active session: ${currentUser.username} (${currentUser.isGuest ? 'Guest' : 'Registered'})`);
        } else {
            results.warnings.push('No active session found');
        }
    } catch (e) {
        results.errors.push('Failed to check current session: ' + e.message);
    }
    
    // Check 5: Required functions
    const requiredFunctions = [
        'registerUser',
        'loginUser',
        'logoutUser',
        'getCurrentSession',
        'updateGameScore',
        'getAllScores',
        'getTopPlayers'
    ];
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            results.passed.push(`Function ${funcName}() is available`);
        } else {
            results.errors.push(`Function ${funcName}() is missing`);
        }
    });
    
    // Check 6: Game integration functions
    const gameFunctions = [
        'saveSudokuScore',
        'saveRPSscore',
        'saveChessScore',
        'saveCheckersScore'
    ];
    
    gameFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            results.passed.push(`Game function ${funcName}() is available`);
        } else {
            results.warnings.push(`Game function ${funcName}() is missing (may not be loaded yet)`);
        }
    });
    
    // Check 7: DOM manipulation safety
    if (typeof safeText === 'function' && typeof safeHTML === 'function') {
        results.passed.push('DOM safety functions are available');
    } else {
        results.warnings.push('DOM safety functions are missing (XSS risk)');
    }
    
    // Check 8: Page structure
    if (document.getElementById('user-status') || document.querySelector('.user-status')) {
        results.passed.push('User status element found');
    } else {
        results.warnings.push('User status element not found');
    }
    
    // Check 9: Navigation
    const navElements = document.querySelectorAll('nav, .nav-links, .navigation');
    if (navElements.length > 0) {
        results.passed.push('Navigation elements found');
    } else {
        results.warnings.push('No navigation elements found');
    }
    
    // Check 10: Responsive design
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        results.passed.push('Viewport meta tag found');
    } else {
        results.warnings.push('Viewport meta tag missing (mobile issues likely)');
    }
    
    return results;
}

/**
 * Display check results in console
 */
function displayCheckResults(results) {
    console.group('📊 SYSTEM CHECK RESULTS');
    console.log('Timestamp:', results.timestamp);
    
    if (results.passed.length > 0) {
        console.groupCollapsed(`✅ PASSED (${results.passed.length})`);
        results.passed.forEach(item => console.log('✓', item));
        console.groupEnd();
    }
    
    if (results.warnings.length > 0) {
        console.groupCollapsed(`⚠️ WARNINGS (${results.warnings.length})`);
        results.warnings.forEach(item => console.log('⚠', item));
        console.groupEnd();
    }
    
    if (results.errors.length > 0) {
        console.groupCollapsed(`❌ ERRORS (${results.errors.length})`);
        results.errors.forEach(item => console.log('✗', item));
        console.groupEnd();
    }
    
    // Overall status
    if (results.errors.length === 0) {
        console.log('%c✨ SYSTEM READY FOR USE ✨', 
            'color: white; background: linear-gradient(90deg, #00cc66, #00ff99); padding: 10px; font-size: 14px; font-weight: bold; border-radius: 5px;');
    } else {
        console.log('%c⚠️ SYSTEM HAS ISSUES ⚠️', 
            'color: white; background: linear-gradient(90deg, #ff9900, #ffcc00); padding: 10px; font-size: 14px; font-weight: bold; border-radius: 5px;');
    }
    
    console.groupEnd();
    
    return results;
}

/**
 * Generate recommendations based on check results
 */
function generateRecommendations(results) {
    const recommendations = [];
    
    if (results.errors.length > 0) {
        recommendations.push('1. ❌ Fix critical errors before proceeding');
    }
    
    if (results.warnings.length > 0) {
        recommendations.push('2. ⚠️ Address warnings for optimal performance');
    }
    
    if (!localStorage.getItem('gyaruGamesUsers')) {
        recommendations.push('3. 🔧 Run system fixes to initialize data structure');
    }
    
    const currentUser = getCurrentSession ? getCurrentSession() : null;
    if (!currentUser) {
        recommendations.push('4. 🔐 Test login/registration functionality');
    }
    
    recommendations.push('5. 🎮 Play each game to verify score saving works');
    recommendations.push('6. 📱 Test on mobile devices for responsiveness');
    recommendations.push('7. 🔄 Clear localStorage and test fresh installation');
    recommendations.push('8. 📝 Document any remaining issues');
    
    return recommendations;
}

/**
 * Run complete system check
 */
function runCompleteSystemCheck() {
    console.log('🔍 Starting comprehensive system check...');
    
    // Run fixes first
    if (typeof applySystemFixes === 'function') {
        const fixResults = applySystemFixes();
        console.log('🔧 System fixes:', fixResults.success ? 'Applied' : 'Failed');
    }
    
    // Perform system check
    const checkResults = performSystemCheck();
    displayCheckResults(checkResults);
    
    // Generate and display recommendations
    const recommendations = generateRecommendations(checkResults);
    
    console.group('💡 RECOMMENDATIONS');
    recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
    
    // Create visual status indicator
    createStatusIndicator(checkResults);
    
    return checkResults;
}

/**
 * Create visual status indicator on page
 */
function createStatusIndicator(results) {
    // Remove existing indicator if present
    const existingIndicator = document.getElementById('system-status-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create new indicator
    const indicator = document.createElement('div');
    indicator.id = 'system-status-indicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: ${results.errors.length > 0 ? '#ff6666' : results.warnings.length > 0 ? '#ffcc00' : '#00cc66'};
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.3s ease;
    `;
    
    const statusIcon = results.errors.length > 0 ? '❌' : results.warnings.length > 0 ? '⚠️' : '✅';
    indicator.innerHTML = `
        <span>${statusIcon}</span>
        <span>System: ${results.errors.length > 0 ? 'Issues' : results.warnings.length > 0 ? 'Warnings' : 'OK'}</span>
    `;
    
    // Add click handler to show details
    indicator.addEventListener('click', function() {
        const details = document.createElement('div');
        details.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 20px;
            background: white;
            color: #333;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            max-height: 400px;
            overflow-y: auto;
            font-size: 12px;
        `;
        
        let detailsHTML = `<strong>System Status</strong><br>`;
        detailsHTML += `<small>${new Date().toLocaleTimeString()}</small><br><br>`;
        
        if (results.passed.length > 0) {
            detailsHTML += `<strong>✅ Passed (${results.passed.length})</strong><br>`;
            results.passed.slice(0, 3).forEach(item => detailsHTML += `• ${item}<br>`);
            if (results.passed.length > 3) detailsHTML += `• ... and ${results.passed.length - 3} more<br>`;
            detailsHTML += `<br>`;
        }
        
        if (results.warnings.length > 0) {
            detailsHTML += `<strong>⚠️ Warnings (${results.warnings.length})</strong><br>`;
            results.warnings.slice(0, 3).forEach(item => detailsHTML += `• ${item}<br>`);
            if (results.warnings.length > 3) detailsHTML += `• ... and ${results.warnings.length - 3} more<br>`;
            detailsHTML += `<br>`;
        }
        
        if (results.errors.length > 0) {
            detailsHTML += `<strong>❌ Errors (${results.errors.length})</strong><br>`;
            results.errors.slice(0, 3).forEach(item => detailsHTML += `• ${item}<br>`);
            if (results.errors.length > 3) detailsHTML += `• ... and ${results.errors.length - 3} more<br>`;
        }
        
        details.innerHTML = detailsHTML;
        document.body.appendChild(details);
        
        // Remove details on click outside
        setTimeout(() => {
            const removeDetails = (e) => {
                if (!details.contains(e.target) && !indicator.contains(e.target)) {
                    details.remove();
                    document.removeEventListener('click', removeDetails);
                }
            };
            document.addEventListener('click', removeDetails);
        }, 100);
    });
    
    document.body.appendChild(indicator);
    
    // Auto-hide after 10 seconds if no errors
    if (results.errors.length === 0) {
        setTimeout(() => {
            indicator.style.transform = 'translateX(-150%)';
            setTimeout(() => indicator.remove(), 500);
        }, 10000);
    }
}

// Auto-run check when page loads
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('%c🔍 GYARU GAMES - FINAL SYSTEM CHECK 🔍', 
            'color: white; background: linear-gradient(90deg, #ff3399, #33ccff); padding: 10px; font-size: 16px; font-weight: bold;');
        
        runCompleteSystemCheck();
        
        // Add manual check button for testing
        const checkButton = document.createElement('button');
        checkButton.textContent = '🔧 System Check';
        checkButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(45deg, #9966ff, #cc99ff);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 20px;
            cursor: pointer;
            z-index: 9998;
            box-shadow: 0 3px 10px rgba(153, 102, 255, 0.3);
            font-size: 12px;
            font-weight: bold;
        `;
        checkButton.addEventListener('click', runCompleteSystemCheck);
        document.body.appendChild(checkButton);
    }, 1000);
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        performSystemCheck,
        displayCheckResults,
        generateRecommendations,
        runCompleteSystemCheck
    };
}