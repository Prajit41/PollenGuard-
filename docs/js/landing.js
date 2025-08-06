document.addEventListener('DOMContentLoaded', function() {
    const skipButton = document.getElementById('skipButton');
    const skipButtonContainer = document.getElementById('skipButtonContainer');
    const loadingContainer = document.querySelector('.loading-container');
    let appReady = false;
    let userRequestedSkip = false;
    
    // Immediately start loading the main app in an iframe (hidden)
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'index.html';
    document.body.appendChild(iframe);
    
    // Set up message channel with the iframe
    window.addEventListener('message', function(event) {
        if (event.data === 'APP_READY') {
            appReady = true;
            // Show the skip button with a nice fade-in
            skipButtonContainer.style.opacity = '1';
        }
    });
    
    // Show skip button after 5 seconds regardless of app readiness
    setTimeout(() => {
        if (!appReady) {
            skipButton.textContent = 'Loading...';
            skipButton.disabled = true;
        }
        skipButtonContainer.style.opacity = '1';
    }, 5000);

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
});
