document.addEventListener('DOMContentLoaded', function() {
    // Navigation elements
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const pages = document.querySelectorAll('.ebook-page');
    let currentPage = 0;
    const totalPages = pages.length;
    
    // App loading elements
    const skipButton = document.getElementById('skipButton');
    const skipButtonContainer = document.getElementById('skipButtonContainer');
    let appReady = false;
    
    // Initialize the app
    function init() {
        // Show first page
        showPage(0);
        updateNavigation();
        
        // Start loading the main app in background
        loadAppInBackground();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Show specific page with transition
    function showPage(pageIndex) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show the selected page
        pages[pageIndex].classList.add('active');
        currentPage = pageIndex;
        updateNavigation();
        
        // Scroll to top of page
        window.scrollTo(0, 0);
    }
    
    // Update navigation buttons and indicators
    function updateNavigation() {
        // Update page indicator
        pageIndicator.textContent = `${currentPage + 1}/${totalPages}`;
        
        // Update navigation buttons
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === totalPages - 1;
        
        // Change next button to "Get Started" on last page
        if (currentPage === totalPages - 1) {
            nextBtn.textContent = 'Get Started';
        } else {
            nextBtn.textContent = 'Next →';
        }
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Navigation buttons
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                showPage(currentPage - 1);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                showPage(currentPage + 1);
            } else if (appReady) {
                redirectToApp();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && currentPage > 0) {
                showPage(currentPage - 1);
            } else if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
                showPage(currentPage + 1);
            } else if (e.key === 'Enter' && currentPage === totalPages - 1 && appReady) {
                redirectToApp();
            }
        });
        
        // Skip button
        skipButton.addEventListener('click', redirectToApp);
    }
    
    // Load main app in background
    function loadAppInBackground() {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'index.html';
        document.body.appendChild(iframe);
        
        // Listen for app ready message
        window.addEventListener('message', function(event) {
            if (event.data === 'APP_READY') {
                appReady = true;
                // Enable the skip button with fade-in effect
                skipButtonContainer.style.opacity = '1';
                skipButton.disabled = false;
                
                // If on last page, update the button text
                if (currentPage === totalPages - 1) {
                    nextBtn.textContent = 'Get Started';
                    nextBtn.disabled = false;
                }
            }
        });
        
        // Show skip button after 5 seconds regardless
        setTimeout(() => {
            skipButtonContainer.style.opacity = '1';
            if (!appReady) {
                skipButton.textContent = 'Loading...';
                skipButton.disabled = true;
            }
        }, 5000);
    }
    
    // Redirect to main app
    function redirectToApp() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
    
    // Initialize the app
    init();
});
