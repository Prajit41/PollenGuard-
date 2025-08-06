document.addEventListener('DOMContentLoaded', function() {
    const timerElement = document.getElementById('timer');
    const skipButton = document.getElementById('skipButton');
    const loadingContainer = document.querySelector('.loading-container');
    let countdown = 5; // Reduced from 15 to 5 seconds
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

    // Preload critical resources immediately
    const resources = [
      { href: 'index.html', as: 'document' },
      { href: 'css/style.css', as: 'style' },
      { href: 'js/script.js', as: 'script' },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', as: 'style' },
      { href: 'https://fonts.gstatic.com', rel: 'preconnect', crossOrigin: true },
      { href: 'https://api.openweathermap.org', rel: 'preconnect' }
    ];

    resources.forEach(resource => {
      const link = document.createElement('link');
      if (resource.rel) link.rel = resource.rel;
      if (resource.as) link.as = resource.as;
      if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
      link.href = resource.href;
      document.head.appendChild(link);
    });

    // Start loading the main app immediately
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'index.html', true);
    xhr.send();
});
