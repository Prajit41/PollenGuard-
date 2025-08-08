// Main application state
const AppState = {
    appReady: false,
    forecastDataLoaded: false,
    currentPage: 0,
    loadingSteps: [
        { id: 'step1', icon: '⏳', text: 'Initializing forecast...' },
        { id: 'step2', icon: '📍', text: 'Detecting your location' },
        { id: 'step3', icon: '🌤️', text: 'Fetching weather data' },
        { id: 'step4', icon: '📊', text: 'Analyzing pollen levels' }
    ]
};

// Loading state management
const LoadingManager = {
    currentStep: 0,
    totalSteps: 4,
    countdownInterval: null,
    
    init() {
        this.currentStep = 0;
        this.updateProgress(0);
        this.startCountdown(10);
    },
    
    updateStep(stepIndex, status = 'loading') {
        if (stepIndex >= 0 && stepIndex < this.totalSteps) {
            const step = document.getElementById(`step${stepIndex + 1}`);
            if (!step) return;
            
            const icon = step.querySelector('.step-icon');
            if (!icon) return;
            
            step.className = 'loading-step';
            
            if (status === 'completed') {
                step.classList.add('completed');
                icon.textContent = '✓';
            } else if (status === 'error') {
                step.classList.add('error');
                icon.textContent = '⚠️';
            } else {
                step.classList.add('active');
                icon.textContent = AppState.loadingSteps[stepIndex].icon;
            }
            
            // Update progress
            const progress = Math.min(100, Math.floor((stepIndex / this.totalSteps) * 100));
            this.updateProgress(progress);
        }
    },
    
    updateProgress(percentage) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        }
    },
    
    startCountdown(seconds) {
        this.stopCountdown();
        let timeLeft = seconds;
        this.updateTimeRemaining(timeLeft);
        
        this.countdownInterval = setInterval(() => {
            timeLeft--;
            this.updateTimeRemaining(timeLeft);
            if (timeLeft <= 0) {
                this.stopCountdown();
            }
        }, 1000);
    },
    
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    },
    
    updateTimeRemaining(seconds) {
        const timeElement = document.getElementById('timeRemaining');
        if (timeElement) {
            timeElement.textContent = seconds;
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const forecastToggle = document.getElementById('forecastToggle');
    const forecastModal = document.getElementById('forecastModal');
    const closeModal = document.querySelector('.close');
    const forecastData = document.getElementById('forecastData');
    const pages = document.querySelectorAll('.ebook-page');
    const skipButton = document.getElementById('skipButton');
    const skipButtonContainer = document.getElementById('skipButtonContainer');
    
    // Initialize the app
    function init() {
        // Start loading the main app in background
        loadAppInBackground();
        
        // Set up event listeners
        setupEventListeners();
        
        // Show first page
        showPage(0);
    }
    
    // Show specific page with transition
    function showPage(pageIndex) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show the selected page
        pages[pageIndex].classList.add('active');
        
        // Scroll to top of page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Forecast toggle button
        forecastToggle.addEventListener('click', toggleForecastModal);
        
        // Close modal button
        closeModal.addEventListener('click', closeForecastModal);
        
        // Close modal when clicking outside content
        window.addEventListener('click', (e) => {
            if (e.target === forecastModal) {
                closeForecastModal();
            }
        });
        
        // Skip button
        if (skipButton) {
            skipButton.addEventListener('click', redirectToApp);
        }
    }
    
    // Toggle forecast modal
    function toggleForecastModal() {
        forecastToggle.classList.toggle('active');
        forecastModal.classList.toggle('active');
        
        if (forecastModal.classList.contains('active')) {
            // Load forecast data when modal is opened
            loadForecastData().catch(error => {
                console.error('Error in forecast modal:', error);
            });
        }
    }
    
    // Close forecast modal
    function closeForecastModal() {
        forecastToggle.classList.remove('active');
        forecastModal.classList.remove('active');
        // Reset the loaded state and clear content to allow reopening
        AppState.forecastDataLoaded = false;
        const forecastContainer = document.getElementById('forecastData');
        if (forecastContainer) {
            forecastContainer.innerHTML = `
                <div class="loading-steps">
                    <div class="loading-step active" data-step="0">
                        <div class="step-icon">🔍</div>
                        <div class="step-text">Initializing forecast...</div>
                    </div>
                    <div class="loading-step" data-step="1">
                        <div class="step-icon">📍</div>
                        <div class="step-text">Detecting your location</div>
                    </div>
                    <div class="loading-step" data-step="2">
                        <div class="step-icon">⛅</div>
                        <div class="step-text">Fetching weather data</div>
                    </div>
                    <div class="loading-step" data-step="3">
                        <div class="step-icon">📊</div>
                        <div class="step-text">Analyzing pollen levels</div>
                    </div>
                </div>
                <div class="loading-progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="time-remaining">
                    <span class="time-text">Estimated time remaining: </span>
                    <span class="time-value">5 seconds</span>
                </div>`;
        }
    }
    
    // Load forecast data
    async function loadForecastData() {
        if (AppState.forecastDataLoaded) return;
        
        // Initialize loading state
        LoadingManager.init();
        LoadingManager.updateStep(0); // Start with first step
        
        try {
            // Step 1: Initialize forecast (simulated delay)
            await new Promise(resolve => setTimeout(resolve, 800));
            LoadingManager.updateStep(0, 'completed');
            LoadingManager.updateStep(1);
            
            // Step 2: Get user's location
            const position = await getCurrentPosition();
            LoadingManager.updateStep(1, 'completed');
            LoadingManager.updateStep(2);
            
            // Step 3: Fetch weather data (simulated delay)
            await new Promise(resolve => setTimeout(resolve, 1000));
            LoadingManager.updateStep(2, 'completed');
            LoadingManager.updateStep(3);
            
            // Step 4: Analyze data (simulated delay)
            await new Promise(resolve => setTimeout(resolve, 1200));
            LoadingManager.updateStep(3, 'completed');
            LoadingManager.updateProgress(100);
            LoadingManager.stopCountdown();
            
            // Prepare the forecast data
            const forecastData = [
                { 
                    title: 'Pollen Level', 
                    value: 'High', 
                    description: 'Grass pollen is very high today',
                    icon: '🌼'
                },
                { 
                    title: 'Allergy Risk', 
                    value: 'Severe', 
                    description: 'Take your allergy medication',
                    icon: '⚠️'
                },
                { 
                    title: 'Air Quality', 
                    value: 'Moderate', 
                    description: 'Sensitive groups may experience symptoms',
                    icon: '💨'
                },
                { 
                    title: 'Humidity', 
                    value: '45%', 
                    description: 'Moderate humidity may affect pollen levels',
                    icon: '💧'
                }
            ];
            
            // Update UI with forecast data
            const forecastContainer = document.getElementById('forecastData');
            if (forecastContainer) {
                forecastContainer.innerHTML = `
                    <div class="forecast-summary">
                        <h3>Today's Forecast</h3>
                        <p>Based on your location in ${position?.coords ? 'your area' : 'the current location'}</p>
                    </div>
        
                <div class="forecast-grid">
                    ${forecastData.map(item => `
                        <div class="forecast-item">
                            <div class="forecast-icon">${item.icon}</div>
                            <div class="forecast-content">
                                <h4>${item.title}</h4>
                                <p class="forecast-value">${item.value}</p>
                                <p class="forecast-description">${item.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="primary-btn" style="margin-top: 1.5rem;" id="viewFullForecast">
                    View Full Forecast
                </button>
            `;
            
            // Add click handler for the view button
            setTimeout(() => {
                const viewButton = document.getElementById('viewFullForecast');
                if (viewButton) {
                    viewButton.addEventListener('click', () => {
                        window.location.href = 'index.html';
                    });
                    
                    // Add animation
                    viewButton.style.animation = 'fadeInUp 0.5s ease forwards';
                    viewButton.style.opacity = '0';
                    setTimeout(() => {
                        viewButton.style.opacity = '1';
                    }, 100);
                }
            }, 0);
            
            AppState.forecastDataLoaded = true;
            
        } catch (error) {
            console.error('Error loading forecast data:', error);
            
            // Show error state
            const errorHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h4>Unable to Load Forecast</h4>
                    <p>We couldn't load your personalized forecast. This might be due to network issues or location services being disabled.</p>
                    <button class="primary-btn" id="retryButton" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            `;
            
            // Update the DOM once
            forecastData.innerHTML = errorHTML;
            
            // Add retry handler after DOM update
            requestAnimationFrame(() => {
                const retryButton = document.getElementById('retryButton');
                if (retryButton) {
                    retryButton.removeEventListener('click', loadForecastData); // Clean up any existing listeners
                    retryButton.addEventListener('click', loadForecastData);
                }
            });
        }
    }
    
    // Get current position with timeout
    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }
            
            // Set a timeout for geolocation
            const options = {
                enableHighAccuracy: true,
                timeout: 5000, // 5 second timeout
                maximumAge: 0
            };
            
            navigator.geolocation.getCurrentPosition(
                position => resolve(position),
                error => {
                    console.warn('Geolocation error:', error);
                    // Continue with default location if geolocation fails
                    resolve({
                        coords: {
                            latitude: 37.7749, // Default to San Francisco
                            longitude: -122.4194
                        }
                    });
                },
                options
            );
        });
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
                AppState.appReady = true;
                updateLoadingState();
            }
        });
        
        // Update loading state after a short delay
        setTimeout(updateLoadingState, 3000);
        
        // Final check after 10 seconds
        setTimeout(updateLoadingState, 10000);
        
        function updateLoadingState() {
            if (!skipButtonContainer) return;
            
            skipButtonContainer.style.opacity = '1';
            
            if (AppState.appReady) {
                skipButton.textContent = 'Enter PollenGuard';
                skipButton.disabled = false;
                
                // Add animation to the button
                skipButton.style.transition = 'all 0.3s ease';
                skipButton.style.transform = 'translateY(0)';
                
                // Update the hint text
                const hint = skipButtonContainer.querySelector('.hint');
                if (hint) {
                    hint.textContent = 'Your personalized forecast is ready!';
                    hint.style.color = '#10b981'; // Green color for success
                }
            } else if (skipButton.textContent === 'Loading...') {
                skipButton.textContent = 'Take Me to the App';
                skipButton.disabled = false;
                
                // Update the hint text
                const hint = skipButtonContainer.querySelector('.hint');
                if (hint) {
                    hint.textContent = 'Loading may take a moment...';
                }
            }
        }
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
