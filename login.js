document.addEventListener('DOMContentLoaded', function() {
    // Mobile detection
    const isMobile = window.innerWidth <= 768;
    
    // Mobile-optimized font sizes
    if (isMobile) {
        document.documentElement.style.fontSize = '14px';
        
        // Adjust form inputs for mobile
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.fontSize = '16px'; // Prevents zoom on iOS
            input.style.minHeight = '44px'; // Minimum touch target
        });
        
        // Adjust buttons for mobile
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
            button.style.touchAction = 'manipulation';
        });
    }
    
    // Optimize tab switching for touch
    const tabButtons = document.querySelectorAll('.tab-switcher button');
    tabButtons.forEach(button => {
        // Add touch feedback
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Optimize password strength meter for mobile
    const passwordInput = document.getElementById('register-password');
    if (passwordInput && isMobile) {
        // Debounce input for mobile performance
        let timeout;
        passwordInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Original strength calculation code...
            }, 300);
        });
    }
    
    // Optimize button clicks for mobile
    const buttons = ['login-btn', 'register-btn', 'guest-btn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            // Prevent double-tap zoom
            btn.style.touchAction = 'manipulation';
            
            // Add active state for touch
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            });
            
            btn.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        }
    });
    
    // Mobile-optimized form validation
    function validateFormMobile() {
        if (!isMobile) return;
        
        // Prevent auto-zoom on focus
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (window.visualViewport) {
                    window.visualViewport.scale = 1;
                }
            });
        });
    }
    
    validateFormMobile();
    
    // Handle virtual keyboard properly
    window.addEventListener('resize', function() {
        if (isMobile) {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                setTimeout(() => {
                    activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }
    });
});