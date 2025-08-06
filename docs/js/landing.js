document.addEventListener('DOMContentLoaded', function() {
    const timerElement = document.getElementById('timer');
    const skipButton = document.getElementById('skipButton');
    const loadingContainer = document.querySelector('.loading-container');
    let countdown = 15; // seconds
    let countdownInterval;

    // Start the countdown
    function startCountdown() {
        updateTimerDisplay();
        countdownInterval = setInterval(() => {
            countdown--;
            updateTimerDisplay();
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                redirectToApp();
            }
        }, 1000);
    }

    // Update the timer display
    function updateTimerDisplay() {
        timerElement.textContent = countdown;
    }

    // Redirect to the main app
    function redirectToApp() {
        // Add a smooth fade-out effect
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        // Wait for the fade-out to complete before redirecting
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    // Skip button event listener
    skipButton.addEventListener('click', () => {
        clearInterval(countdownInterval);
        redirectToApp();
    });

    // Start the countdown when the page loads
    startCountdown();

    // Preload the main app in the background
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'index.html';
    document.head.appendChild(link);

    // Preload CSS and JS for the main app
    const preloadCSS = document.createElement('link');
    preloadCSS.rel = 'preload';
    preloadCSS.href = 'css/style.css';
    preloadCSS.as = 'style';
    document.head.appendChild(preloadCSS);

    const preloadJS = document.createElement('link');
    preloadJS.rel = 'preload';
    preloadJS.href = 'js/script.js';
    preloadJS.as = 'script';
    document.head.appendChild(preloadJS);
});
