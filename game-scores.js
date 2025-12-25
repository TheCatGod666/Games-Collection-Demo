// Add at the beginning of the file
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Optimize showScoreFeedback for mobile
function showScoreFeedback(game, message) {
    try {
        // Remove existing feedback
        const existingFeedback = document.getElementById('score-feedback');
        if (existingFeedback) existingFeedback.remove();
        
        // Mobile-specific positioning
        const isMobile = window.innerWidth <= 768;
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'score-feedback';
        
        // Mobile-optimized styles
        feedbackDiv.style.cssText = `
            position: fixed;
            ${isMobile ? 'top: 20px; left: 10px; right: 10px;' : 'top: 100px; right: 20px;'}
            background: linear-gradient(45deg, #00cc66, #00ff99);
            color: white;
            padding: ${isMobile ? '12px 15px' : '15px 25px'};
            border-radius: ${isMobile ? '12px' : '15px'};
            border: ${isMobile ? '2px' : '3px'} solid white;
            box-shadow: 0 5px 20px rgba(0, 204, 102, 0.5);
            z-index: 10000;
            font-weight: bold;
            text-align: center;
            min-width: ${isMobile ? 'auto' : '200px'};
            max-width: ${isMobile ? 'calc(100vw - 20px)' : '300px'};
            animation: ${isMobile ? 'slideInTop 0.5s ease' : 'slideInRight 0.5s ease'};
            font-size: ${isMobile ? '14px' : 'inherit'};
            margin: ${isMobile ? '0 auto' : '0'};
            word-wrap: break-word;
            overflow-wrap: break-word;
        `;
        
        // Rest of the function remains the same until the animation CSS...
        
        // Add CSS animation if not already present
        if (!document.querySelector('#score-feedback-style')) {
            const style = document.createElement('style');
            style.id = 'score-feedback-style';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes slideInTop {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideOutTop {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Auto-hide after shorter time on mobile
        const hideTime = isMobile ? 2000 : 3000;
        
        setTimeout(() => {
            feedbackDiv.style.animation = isMobile ? 'slideOutTop 0.5s ease forwards' : 'slideOutRight 0.5s ease forwards';
            setTimeout(() => {
                if (feedbackDiv.parentNode) feedbackDiv.remove();
            }, 500);
        }, hideTime);
        
        return true;
    } catch (error) {
        console.error('Show score feedback error:', error);
        return false;
    }
}

// Optimize checkLoginStatus modal for mobile
function checkLoginStatus(game) {
    try {
        const currentUser = getCurrentSession ? getCurrentSession() : null;
        
        if (!currentUser || currentUser.isGuest) {
            if (document.getElementById('login-prompt-modal')) return false;
            
            const isMobile = window.innerWidth <= 768;
            
            // Create modal backdrop with mobile optimizations
            const backdrop = document.createElement('div');
            backdrop.id = 'login-prompt-backdrop';
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                z-index: 9998;
                animation: fadeIn 0.3s ease;
                touch-action: none; /* Prevent scrolling behind modal */
            `;
            
            // Create prompt modal
            const promptDiv = document.createElement('div');
            promptDiv.id = 'login-prompt-modal';
            promptDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(45deg, #ff3399, #ffcc00);
                color: white;
                padding: ${isMobile ? '20px 15px' : '30px'};
                border-radius: ${isMobile ? '15px' : '20px'};
                border: ${isMobile ? '3px' : '5px'} solid white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 9999;
                text-align: center;
                width: ${isMobile ? 'calc(100vw - 40px)' : 'auto'};
                min-width: ${isMobile ? 'auto' : '300px'};
                max-width: ${isMobile ? '90vw' : '500px'};
                animation: popIn 0.5s ease;
                max-height: ${isMobile ? '80vh' : 'auto'};
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            `;
            
            // Mobile-optimized button container
            const buttonContainerStyle = `
                display: flex;
                flex-direction: ${isMobile ? 'column' : 'row'};
                gap: ${isMobile ? '10px' : '10px'};
                justify-content: center;
                align-items: center;
                margin-top: 20px;
            `;
            
            const buttonStyle = `
                background: linear-gradient(45deg, #33ccff, #66ffff);
                border: none;
                color: white;
                padding: ${isMobile ? '14px 20px' : '12px 24px'};
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                font-size: ${isMobile ? '16px' : '1em'};
                width: ${isMobile ? '100%' : 'auto'};
                min-width: ${isMobile ? 'auto' : '150px'};
                min-height: 44px; /* Minimum touch target size */
                touch-action: manipulation;
            `;
            
            // Use textContent instead of innerHTML for mobile performance
            promptDiv.innerHTML = `
                <h3 style="margin: 0 0 15px 0; font-size: ${isMobile ? '1.3em' : '1.5em'};">
                    🎮 Play ${gameNames[game] || 'Game'}!
                </h3>
                <p style="margin: 0 0 20px 0; font-size: ${isMobile ? '1em' : '1.1em'};">
                    You're playing as a guest. Scores won't be saved permanently.
                </p>
                <div style="${buttonContainerStyle}">
                    <button id="continue-guest" style="${buttonStyle.replace('#33ccff, #66ffff', '#33ccff, #66ffff')}">
                        Continue as Guest
                    </button>
                    <button id="go-login" style="${buttonStyle.replace('#33ccff, #66ffff', '#00cc66, #00ff99')}">
                        Login/Sign Up
                    </button>
                </div>
                <p style="margin: 20px 0 0 0; font-size: ${isMobile ? '0.8em' : '0.9em'}; opacity: 0.9;">
                    Guests can still play, but scores reset when you leave.
                </p>
            `;
            
            document.body.appendChild(backdrop);
            document.body.appendChild(promptDiv);
            
            // Add event listeners with touch optimizations
            const continueBtn = document.getElementById('continue-guest');
            const loginBtn = document.getElementById('go-login');
            
            const handleButtonClick = (callback) => {
                return (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    backdrop.remove();
                    promptDiv.remove();
                    if (callback) callback();
                };
            };
            
            continueBtn.addEventListener('click', handleButtonClick(() => {
                if (typeof enterGuestMode === 'function') {
                    enterGuestMode();
                } else {
                    localStorage.setItem('guestMode', 'true');
                }
            }));
            
            loginBtn.addEventListener('click', handleButtonClick(() => {
                window.location.href = 'login.html';
            }));
            
            // Add touch events for better mobile response
            continueBtn.addEventListener('touchstart', (e) => {
                e.currentTarget.style.opacity = '0.8';
            });
            continueBtn.addEventListener('touchend', (e) => {
                e.currentTarget.style.opacity = '1';
            });
            
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Check login status error:', error);
        return false;
    }
}