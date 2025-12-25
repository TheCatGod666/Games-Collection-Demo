// mobile-optimizations.js

/**
 * Mobile optimization utilities for Gyaru Games
 */

// Detect mobile device
const MOBILE_OPTIMIZATIONS = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    
    // Initialize mobile optimizations
    init: function() {
        if (!this.isMobile) return;
        
        console.log('Applying mobile optimizations...');
        
        // 1. Prevent zoom on input focus (iOS)
        if (this.isIOS) {
            this.preventZoomOnInput();
        }
        
        // 2. Optimize touch interactions
        this.optimizeTouchTargets();
        
        // 3. Adjust viewport for virtual keyboard
        this.handleVirtualKeyboard();
        
        // 4. Optimize animations for mobile
        this.optimizeAnimations();
        
        // 5. Reduce memory usage
        this.optimizeMemory();
    },
    
    // Prevent auto-zoom on input focus in iOS
    preventZoomOnInput: function() {
        document.addEventListener('touchstart', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                }
            }
        });
        
        document.addEventListener('blur', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                setTimeout(function() {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                    }
                }, 100);
            }
        }, true);
    },
    
    // Ensure touch targets are at least 44px
    optimizeTouchTargets: function() {
        const style = document.createElement('style');
        style.textContent = `
            button, 
            .btn, 
            input[type="button"], 
            input[type="submit"],
            .tab-switcher button,
            .game-control {
                min-height: 44px !important;
                min-width: 44px !important;
                padding: 12px 16px !important;
            }
            
            input, select, textarea {
                font-size: 16px !important; /* Prevents iOS zoom */
                line-height: 1.5 !important;
            }
            
            /* Improve touch feedback */
            button:active, .btn:active {
                opacity: 0.7 !important;
                transform: scale(0.98) !important;
                transition: all 0.1s ease !important;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Handle virtual keyboard issues
    handleVirtualKeyboard: function() {
        let originalHeight = window.innerHeight;
        
        window.addEventListener('resize', function() {
            if (window.innerHeight < originalHeight) {
                // Keyboard is showing
                document.body.classList.add('keyboard-open');
                
                // Scroll active input into view
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    setTimeout(() => {
                        activeElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 300);
                }
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });
    },
    
    // Optimize animations for mobile
    optimizeAnimations: function() {
        // Reduce animation complexity on mobile
        const style = document.createElement('style');
        style.textContent = `
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            /* Hardware acceleration for smoother animations */
            .animated-element {
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Optimize memory usage
    optimizeMemory: function() {
        // Clean up old data on mobile
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        // Remove old backups (keep only last 2 on mobile)
        const backupKeys = Object.keys(localStorage)
            .filter(k => k.startsWith('gyaruGamesBackup_'))
            .sort();
        
        if (backupKeys.length > 2) {
            backupKeys.slice(0, -2).forEach(k => localStorage.removeItem(k));
        }
        
        // Clear old guest sessions
        const sessionStart = localStorage.getItem('sessionStart');
        if (sessionStart && (now - parseInt(sessionStart)) > oneDay) {
            localStorage.removeItem('gyaruGamesCurrentUser');
            localStorage.setItem('guestMode', 'false');
        }
    },
    
    // Debounce function for mobile performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for scroll/touch events
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    MOBILE_OPTIMIZATIONS.init();
    
    // Add mobile-specific CSS
    if (MOBILE_OPTIMIZATIONS.isMobile) {
        const mobileCSS = document.createElement('style');
        mobileCSS.textContent = `
            /* Mobile-specific styles */
            body {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
            }
            
            /* Prevent text selection on buttons */
            button {
                user-select: none;
                -webkit-user-select: none;
            }
            
            /* Optimize scroll performance */
            .scroll-container {
                -webkit-overflow-scrolling: touch;
                overflow-scrolling: touch;
            }
            
            /* Adjust font sizes for mobile */
            @media (max-width: 768px) {
                html { font-size: 14px; }
                h1 { font-size: 1.8rem; }
                h2 { font-size: 1.5rem; }
                h3 { font-size: 1.3rem; }
                
                /* Stack elements vertically on mobile */
                .horizontal-layout {
                    flex-direction: column !important;
                }
                
                /* Full-width buttons on mobile */
                .mobile-full-width {
                    width: 100% !important;
                    margin: 5px 0 !important;
                }
            }
            
            /* iPhone X+ safe areas */
            @supports (padding: max(0px)) {
                body {
                    padding-left: min(0vmin, env(safe-area-inset-left));
                    padding-right: min(0vmin, env(safe-area-inset-right));
                    padding-bottom: min(0vmin, env(safe-area-inset-bottom));
                }
            }
        `;
        document.head.appendChild(mobileCSS);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MOBILE_OPTIMIZATIONS;
}