document.addEventListener('DOMContentLoaded', function() {
    const skipButton = document.getElementById('skipButton');
    const loadingContainer = document.querySelector('.loading-container');
    let appReady = false;
    let userRequestedSkip = false;
    
    // Hide the countdown timer since we're not using it anymore
    const timerElement = document.getElementById('timer');
    if (timerElement) timerElement.style.display = 'none';

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
        userRequestedSkip = true;
        if (appReady) {
            redirectToApp();
        } else {
            skipButton.textContent = 'Loading...';
            skipButton.disabled = true;
        }
    });

    // Function to preload resources
    function preloadResources() {
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
    }

    // Function to handle when the app is ready
    function appIsReady() {
        appReady = true;
        if (userRequestedSkip) {
            redirectToApp();
        } else {
            skipButton.textContent = 'Enter App';
            skipButton.disabled = false;
        }
    }

    // Start preloading resources
    preloadResources();
    
    // Set a timeout to ensure the main page loads within 5 seconds
    const mainAppLoader = new Promise((resolve) => {
        // This will be resolved when the main app signals it's ready
        window.appReady = resolve;
    });
    
    Promise.race([
        mainAppLoader,
        new Promise(resolve => setTimeout(resolve, 5000)) // Max 5 second wait
    ]).then(() => {
        appIsReady();
    });
    
    // Start loading the main app in an iframe to warm it up
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'index.html';
    document.body.appendChild(iframe);
});
