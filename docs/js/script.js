class AdvancedAllergyForecastApp {
  constructor() {
    // API Configuration
    this.config = {
      weatherApiKey: "bd78e54d0186477047d25911103391ab",
      pollenApiKey: "",
      cacheExpiry: 60 * 1000, // 1 minute cache expiry
      apiTimeout: 2000, // 2 second timeout for API calls
      backendUrl: "https://your-backend-api.com/forecast" // Replace with your actual backend URL
    };
    
    // App State
    this.forecastData = [];
    this.selectedDay = 0;
    this.chart = null;
    this.currentLocation = null;
    this.currentWeatherData = null;
    this.currentRiskData = null;
    this.aiSummaryText = "";
    this.alerts = [];
    this.cache = new Map();
    this.isLoading = false;
    this.isInitialized = false;

    // Chart colors
    this.chartColors = {
      tree: "#8B4513",
      grass: "#32CD32",
      weed: "#DAA520"
    };

    // Health tips
    this.healthTips = {
      high: [
        "Consider staying indoors with windows closed",
        "Wear sunglasses to protect your eyes",
        "Shower after being outside to remove pollen"
      ],
      medium: [
        "Keep windows closed during peak pollen hours",
        "Wash your face and hands after being outside"
      ],
      low: [
        "Enjoy the outdoors but be aware of symptoms",
        "Keep track of your allergy symptoms"
      ]
    };

    // Initialize the app
    this.init();
  }
  
  // Initialize the application
  init() {
    // Show UI immediately with demo data
    this.initializeUI();
    this.setupEventListeners();
    this.useDemoData();
    this.showContent();
    
    // Start loading real data
    this.loadEssentialData()
      .then(() => {
        // Signal to parent window (if in iframe) that we're ready
        if (window.self !== window.top) {
          window.parent.postMessage('APP_READY', '*');
        }
      })
      .catch(console.error);
  }
  
  // Load essential data with optimized caching and parallel requests
  async loadEssentialData() {
    if (this.isLoading) return;
    this.isLoading = true;
    
    try {
      this.showLoadingState('Loading forecast...');
      
      // Get location - try cached first, then geolocation
      const location = await this.getUserLocation();
      
      if (!location) {
        this.showError('Unable to determine your location. Using demo data.');
        this.useDemoData();
        return;
      }
      
      // Fetch all required data in parallel
      const [weatherData, pollenData] = await Promise.all([
        this.fetchWeatherData(location.latitude, location.longitude),
        this.fetchPollenData(location.latitude, location.longitude)
      ]);
      
      // Process and update UI with fresh data
      this.processForecastData(weatherData, pollenData);
      this.updateUI();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Error loading forecast. Using demo data.');
      this.useDemoData();
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }
  
  // Get user location with caching
  async getUserLocation() {
    const cacheKey = 'user_location';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 5 * 60 * 1000 // 5 minutes
        });
      });
      
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      };
      
      this.cacheData(cacheKey, location, 30 * 60 * 1000); // Cache for 30 minutes
      return location;
      
    } catch (error) {
      console.warn('Geolocation error:', error);
      return null;
    }
  }
          this.getCurrentPosition(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Geolocation timeout')), 5000))
        ]);
      }
      
      this.currentLocation = { 
        latitude: position.coords.latitude, 
        longitude: position.coords.longitude 
      };
      
      // Save location for next time
      localStorage.setItem('lastLocation', JSON.stringify({
        ...this.currentLocation,
        timestamp: Date.now()
      }));
      
      // Try to load cached data first for instant display
      const cachedWeather = localStorage.getItem('cachedWeather');
      const cachedPollen = localStorage.getItem('cachedPollen');
      
      if (cachedWeather) {
        const { data, timestamp } = JSON.parse(cachedWeather);
        const isFresh = Date.now() - timestamp < 60 * 1000; // 1 minute
        if (isFresh) {
          this.currentWeatherData = data;
          this.updateUIWithData();
        }
      }
      
      if (cachedPollen) {
        const { data, timestamp } = JSON.parse(cachedPollen);
        const isFresh = Date.now() - timestamp < 60 * 1000; // 1 minute
        if (isFresh) {
          this.currentPollenData = data;
          this.updateUIWithData();
        }
      }
      
      // Fetch fresh data in parallel
      this.showLoadingState('Fetching latest forecast data...');
      const [weatherData, pollenData] = await Promise.race([
        Promise.all([
          this.fetchWeatherData(this.currentLocation.latitude, this.currentLocation.longitude, false)
            .catch(err => {
              console.error('Weather fetch error:', err);
              return this.currentWeatherData || this.getDemoWeatherData();
            }),
          this.fetchPollenData(this.currentLocation.latitude, this.currentLocation.longitude, false)
            .catch(err => {
              console.error('Pollen fetch error:', err);
              return this.currentPollenData || this.generateSimulated7DayForecast();
            })
        ]),
        timeoutPromise
      ]);
      
      // Update UI with fresh data
      this.currentWeatherData = weatherData;
      this.currentPollenData = pollenData;
      this.updateUIWithData();
      
      // Cache the fresh data
      localStorage.setItem('cachedWeather', JSON.stringify({
        data: weatherData,
        timestamp: Date.now()
      }));
      
      localStorage.setItem('cachedPollen', JSON.stringify({
        data: pollenData,
        timestamp: Date.now()
      }));
      
      // Use cached data if available and not expired (less than 30 minutes old)
      if (cachedLocation) {
        const { latitude, longitude, timestamp } = JSON.parse(cachedLocation);
        const isLocationFresh = Date.now() - timestamp < 30 * 60 * 1000; // 30 minutes
        
        if (isLocationFresh) {
          this.currentLocation = { latitude, longitude };
          
          // Load cached weather data if available
          if (cachedWeather) {
            const { data, timestamp } = JSON.parse(cachedWeather);
            const isWeatherFresh = Date.now() - timestamp < 30 * 60 * 1000; // 30 minutes
            if (isWeatherFresh) {
              this.currentWeatherData = data;
              this.updateUIWithData();
            }
          }
          
          // Load cached pollen data if available
          if (cachedPollen) {
            const { data, timestamp } = JSON.parse(cachedPollen);
            const isPollenFresh = Date.now() - timestamp < 30 * 60 * 1000; // 30 minutes
            if (isPollenFresh) {
              this.currentPollenData = data;
              this.updateUIWithData();
            }
          }
        }
      }
      
      // Start fresh data fetch in parallel
      const fetchOperations = [
        this.getCurrentPosition()
          .then(position => {
            this.currentLocation = { 
              latitude: position.coords.latitude, 
              longitude: position.coords.longitude 
            };
            // Cache the location with timestamp
            localStorage.setItem('lastLocation', JSON.stringify({
              ...this.currentLocation,
              timestamp: Date.now()
            }));
            
            // Fetch fresh data
            return Promise.all([
              this.fetchWeatherData(this.currentLocation.latitude, this.currentLocation.longitude, false)
                .then(data => {
                  // Cache the fresh data
                  localStorage.setItem('cachedWeather', JSON.stringify({
                    data,
                    timestamp: Date.now()
                  }));
                  return data;
                }),
                
              this.fetchPollenData(this.currentLocation.latitude, this.currentLocation.longitude, false)
                .then(data => {
                  // Cache the fresh data
                  localStorage.setItem('cachedPollen', JSON.stringify({
                    data,
                    timestamp: Date.now()
                  }));
                  return data;
                })
            ]);
          })
          .catch(console.error)
      ];
      
      // Wait for either the operations to complete or the timeout
      await Promise.race([
        Promise.all(fetchOperations),
        timeoutPromise
      ]);
      
    } catch (error) {
      console.log('Background data refresh failed, continuing with demo data', error);
      
      // Try to use last known location from localStorage
      const lastLocation = localStorage.getItem('lastLocation');
      if (lastLocation) {
        const { latitude, longitude } = JSON.parse(lastLocation);
        this.fetchWeatherData(latitude, longitude, false).catch(console.error);
        this.fetchPollenData(latitude, longitude, false).catch(console.error);
      }
    } 
    // Fall back to demo data if there's an error
    this.useDemoData();
    this.showError('Using demo data. Some features may be limited.');
  }
  
  // Show loading state with message
  showLoadingState(message = 'Loading...') {
    const loadingElement = document.getElementById('loadingState') || this.createLoadingElement();
    if (loadingElement) {
      loadingElement.innerHTML = `
        <div class="loading-content">
          <h2>Welcome to PollenGuard+</h2>
          <p>${message}</p>
          <div class="loading-animation">
            <div class="spinner"></div>
          </div>
        </div>
      `;
      loadingElement.style.display = 'block';
    }
    console.log('Loading:', message);
  }
  
  // Create loading element if it doesn't exist
  createLoadingElement() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loadingState';
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '0';
    loadingElement.style.left = '0';
    loadingElement.style.width = '100%';
    loadingElement.style.height = '100%';
    loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    loadingElement.style.display = 'flex';
    loadingElement.style.justifyContent = 'center';
    loadingElement.style.alignItems = 'center';
    loadingElement.style.zIndex = '1000';
    loadingElement.style.textAlign = 'center';
    loadingElement.style.padding = '20px';
    loadingElement.style.boxSizing = 'border-box';
    
    // Add some basic styling for the spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border-left-color: #09f;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      .loading-content {
        max-width: 400px;
        margin: 0 auto;
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loadingElement);
    return loadingElement;
  }
              <div class="spinner"></div>
            </div>
          </div>
        `;
      } else {
        // Just update the message if loading state already exists
        const messageEl = mainContent.querySelector('.loading-state p');
        if (messageEl) messageEl.textContent = message;
      }
    }
  }

  // Show demo data immediately while loading real data
  useDemoData() {
    console.log('Using demo data');
    
    // Generate demo forecast data
    const demoForecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const treePollen = Math.floor(Math.random() * 5) + 3;
      const grassPollen = Math.floor(Math.random() * 3) + 1;
      const weedPollen = Math.floor(Math.random() * 7) + 2;
      const totalPollen = treePollen + grassPollen + weedPollen;
      
      demoForecast.push({
        day: i === 0 ? 'Today' : days[date.getDay()],
        dateString: date.toISOString().split('T')[0],
        treePollen,
        grassPollen,
        weedPollen,
        totalPollen,
        temperature: `${Math.floor(18 + Math.random() * 10)}°C`,
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
      });
    }
    
    // Create demo data object
    const demoData = {
      weather: {
        temperature: `${Math.floor(20 + Math.random() * 8)}°C`,
        humidity: `${Math.floor(40 + Math.random() * 40)}%`,
        windSpeed: `${(Math.random() * 10).toFixed(1)} m/s`,
        condition: 'Partly Cloudy',
        city: 'Demo City',
        country: 'Demo Country'
      },
      pollen: {
        tree: 'Medium',
        grass: 'Low',
        weed: 'High',
        treeValue: demoForecast[0].treePollen,
        grassValue: demoForecast[0].grassPollen,
        weedValue: demoForecast[0].weedPollen
      },
      risk: {
        level: 'moderate',
        factors: ['High weed pollen', 'Moderate wind speed'],
        primaryTrigger: 'Weed Pollen',
        healthTip: 'Consider staying indoors with windows closed',
        riskClass: 'moderate-risk',
        text: 'Moderate',
        class: 'moderate'
      },
      forecast: demoForecast
    };
    
    // Update UI with demo data
    this.updateUIWithData(demoData);
    
    // Remove loading state
    document.body.classList.remove('loading');
    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.textContent = '';
    
    console.log('Demo data loaded');
  }
  
  // Initialize the application UI
  initializeUI() {
    // Set up any initial UI elements
    document.body.classList.add('loading');
  }
  
  // Set up event listeners
  setupEventListeners() {
    // Tab click handlers
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = tab.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (!this.currentLocation.latitude) {
          // If we don't have location yet, fetch it first
          this.showLoadingState('Getting your location...');
          this.fetchLocationAndAllData();
        } else {
          // Otherwise, update the UI for the selected tab
          this.updateUIForTab(tabName);
        }
      });
    });
    
    // Initial tab activation if in URL hash
    const initialTab = window.location.hash ? window.location.hash.substring(1) : 'overview';
    const tabElement = document.querySelector(`.nav-tab[data-tab="${initialTab}"]`);
    if (tabElement) {
      tabElement.click();
    } else {
      // Default to overview tab if no valid hash
      document.querySelector('.nav-tab[data-tab="overview"]')?.classList.add('active');
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      const tabName = window.location.hash ? window.location.hash.substring(1) : 'overview';
      const tabElement = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
      if (tabElement) {
        tabElement.click();
      }
    });
  }
  
  // Update UI based on selected tab
  updateUIForTab(tabName) {
    // If we already have the tab content, just show it
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent && !tabContent.classList.contains('needs-update')) {
      this.showTabContent(tabName);
      return;
    }
    
    // Otherwise show loading state
    this.showLoadingState(`Loading ${tabName} data...`);
    
    // Load data for the selected tab
    switch(tabName) {
      case 'forecast':
        this.loadForecastData();
        break;
      case 'alerts':
        this.loadAlertsData();
        break;
      // Add more cases for other tabs
      default:
        this.loadOverviewData();
    }
  }
  
  // Load data in the background
  async loadDataInBackground() {
    try {
      // Show loading state
      const loadingText = document.getElementById('loading-text');
      if (loadingText) loadingText.textContent = 'Loading forecast data...';
      
      // Try to load real data
      await this.fetchLocationAndAllData();
    } catch (error) {
      console.error('Error loading data:', error);
      // If there's an error, we already have demo data showing
    } finally {
      // Remove loading state
      document.body.classList.remove('loading');
      const loadingText = document.getElementById('loading-text');
      if (loadingText) loadingText.textContent = '';
    }
  }
  
  // Fetch location and all data
  async fetchLocationAndAllData() {
    try {
      const position = await this.getCurrentPosition();
      this.currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      // Show loading state
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.innerHTML = `
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Fetching your local data...</p>
          </div>
        `;
      }
      
      // Load additional data in the background
      this.loadAdditionalData();
      
      // Load initial data
      await Promise.all([
        this.fetchWeatherData(this.currentLocation.latitude, this.currentLocation.longitude),
        this.fetchPollenData(this.currentLocation.latitude, this.currentLocation.longitude)
      ]);
      
      // Update UI with the loaded data
      this.updateUIWithData();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Show error state
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.innerHTML = `
          <div class="error-state">
            <h3>Error Loading Data</h3>
            <p>${error.message || 'Failed to load data. Please try again later.'}</p>
            <button id="retry-btn" class="btn btn-primary">Retry</button>
          </div>
        `;
        
        // Add retry button handler
        document.getElementById('retry-btn')?.addEventListener('click', () => {
          this.fetchLocationAndAllData();
        });
      }
    }
  }
  
  // Load data for overview tab
  async loadOverviewData() {
    if (!this.currentLocation.latitude) return;
    
    try {
      // Load only basic weather data for overview
      await this.fetchWeatherData(this.currentLocation.latitude, this.currentLocation.longitude);
      // Update UI with just the weather data
      this.updateUIWithData();
    } catch (error) {
      console.error('Error loading overview data:', error);
    }
  }
  
  // Load data for forecast tab
  async loadForecastData() {
    if (!this.currentLocation.latitude) return;
    
    try {
      // Load both weather and pollen data for forecast
      await Promise.all([
        this.fetchWeatherData(this.currentLocation.latitude, this.currentLocation.longitude),
        this.fetchPollenData(this.currentLocation.latitude, this.currentLocation.longitude)
      ]);
      // Update UI with all data
      this.updateUIWithData();
    } catch (error) {
      console.error('Error loading forecast data:', error);
    }
  }
  
  // Load data for alerts tab
  async loadAlertsData() {
    if (!this.currentLocation.latitude) return;
    
    try {
      // Load only the data needed for alerts
      await this.fetchWeatherData(this.currentLocation.latitude, this.currentLocation.longitude);
      // Update UI with alerts data
      this.updateUIWithData();
    } catch (error) {
      console.error('Error loading alerts data:', error);
    }
  }
  
  // Update UI with data
  updateUIWithData(data) {
    if (!data) return;
    
    // Update weather info
    if (data.weather) {
      const weatherEl = document.getElementById('weather-info');
      if (weatherEl) {
        weatherEl.innerHTML = `
          <h2>${data.weather.city}, ${data.weather.country}</h2>
          <div class="weather-temp">${data.weather.temperature}</div>
          <div class="weather-desc">${data.weather.condition}</div>
          <div class="weather-details">
            <span>Humidity: ${data.weather.humidity}</span>
            <span>Wind: ${data.weather.windSpeed}</span>
          </div>
        `;
      }
    }
    
    // Update pollen info
    if (data.pollen) {
      const pollenEl = document.getElementById('pollen-levels');
      if (pollenEl) {
        pollenEl.innerHTML = `
          <h3>Pollen Levels</h3>
          <div class="pollen-levels">
            <div class="pollen-type">
              <span class="pollen-name">Tree</span>
              <span class="pollen-value ${data.pollen.tree.toLowerCase()}">${data.pollen.tree}</span>
            </div>
            <div class="pollen-type">
              <span class="pollen-name">Grass</span>
              <span class="pollen-value ${data.pollen.grass.toLowerCase()}">${data.pollen.grass}</span>
            </div>
            <div class="pollen-type">
              <span class="pollen-name">Weed</span>
              <span class="pollen-value ${data.pollen.weed.toLowerCase()}">${data.pollen.weed}</span>
            </div>
          </div>
        `;
      }
    }
    
    // Update risk info
    if (data.risk) {
      const riskEl = document.getElementById('risk-level');
      if (riskEl) {
        riskEl.innerHTML = `
          <h3>Allergy Risk: <span class="${data.risk.riskClass}">${data.risk.text}</span></h3>
          <p>${data.risk.healthTip}</p>
          <div class="risk-factors">
            <h4>Key Factors:</h4>
            <ul>
              ${data.risk.factors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    }
    
    // Update forecast
    if (data.forecast && data.forecast.length > 0) {
      this.updateForecastUI(data.forecast);
    }
  }
  
  // Update forecast UI
  updateForecastUI(forecast) {
    const forecastEl = document.getElementById('forecast');
    if (!forecastEl) return;
    
    forecastEl.innerHTML = `
      <h3>7-Day Forecast</h3>
      <div class="forecast-container">
        ${forecast.map((day, index) => `
          <div class="forecast-day">
            <div class="day">${index === 0 ? 'Today' : day.day}</div>
            <div class="temp">${day.temperature}</div>
            <div class="condition">${day.condition}</div>
            <div class="pollen">
              <span class="pollen-type">🌳 ${day.treePollen}</span>
              <span class="pollen-type">🌾 ${day.grassPollen}</span>
              <span class="pollen-type">🌿 ${day.weedPollen}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Get current position
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation is not supported by this browser'));
      }
    });
  }
  
  // Helper function to fetch with timeout
  async fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
      });
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }
  
  // Cache management helpers
  getCachedData(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  cacheData(key, data, ttl = this.config.cacheExpiry) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
  
  // Fetch weather data with optimized caching
  async fetchWeatherData(lat, lon) {
    const cacheKey = `weather_${lat}_${lon}`;
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;
        return cached.data;
      }
      
      // Check localStorage for cached weather data
      const cachedWeather = localStorage.getItem('cachedWeather');
      if (cachedWeather) {
        const { data, timestamp } = JSON.parse(cachedWeather);
        if (Date.now() - timestamp < cacheExpiry) {
          this.currentWeatherData = data;
          this.updateUIWithData(); // Update UI immediately with cached data
          return data;
        }
      }
    }
    
    // Return cached data immediately if available and fresh
    if (useCache) {
      const cached = this.getFromCache(cacheKey, cacheExpiry);
      if (cached) {
        this.currentWeatherData = cached.data;
        return cached.data;
      }
    }
    
    // Start with demo data for instant display
    if (this.demoData.weather) {
      this.currentWeatherData = this.demoData.weather;
    }
    
    // Fetch fresh data in background
    (async () => {
      try {
        const data = await this.fetchWithTimeout(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.weatherApiKey}&units=metric`,
          { timeout: 2000 } // Shorter timeout
        );
        
        const weatherData = {
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          icon: this.getWeatherIcon(data.weather[0].id),
          timestamp: Date.now()
        };
        
        // Update cache and UI
        this.saveToCache(cacheKey, weatherData);
        this.currentWeatherData = weatherData;
        this.updateUIWithData();
      } catch (error) {
        console.log('Background weather update failed, using cached/demo data');
      }
    })();
    
    // Return whatever data we have (demo or cached)
    return this.currentWeatherData || this.demoData.weather;
  }
  
  // Get demo weather data as fallback
  getDemoWeatherData() {
    return {
      temperature: '24°C',
      humidity: '65%',
      windSpeed: '12.5 km/h',
      condition: 'Clouds',
      city: 'Demo City',
      country: 'Demo Country'
    };
  }
  
  // Fetch pollen data
  async fetchPollenData(lat, lon) {
    try {
      // In a real app, you would fetch from your pollen API here
      // For now, we'll just generate some sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const treePollen = Math.floor(Math.random() * 10);
      const grassPollen = Math.floor(Math.random() * 8);
      const weedPollen = Math.floor(Math.random() * 12);
      
      this.currentPollenData = {
        tree: this.getPollenLevel(treePollen),
        grass: this.getPollenLevel(grassPollen),
        weed: this.getPollenLevel(weedPollen),
        treeValue: treePollen,
        grassValue: grassPollen,
        weedValue: weedPollen
      };
      
      // Generate forecast data
      this.forecastData = [];
      const today = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const tree = Math.max(0, Math.min(10, treePollen + Math.floor(Math.random() * 4) - 2));
        const grass = Math.max(0, Math.min(8, grassPollen + Math.floor(Math.random() * 3) - 1));
        const weed = Math.max(0, Math.min(12, weedPollen + Math.floor(Math.random() * 5) - 2));
        
        this.forecastData.push({
          day: i === 0 ? 'Today' : days[date.getDay()],
          dateString: date.toISOString().split('T')[0],
          treePollen: tree,
          grassPollen: grass,
          weedPollen: weed,
          totalPollen: tree + grass + weed,
          temperature: `${Math.round(15 + Math.random() * 15)}°C`,
          condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Thunderstorm'][Math.floor(Math.random() * 6)]
        });
      }
      
      // Calculate risk level
      const totalPollen = treePollen + grassPollen + weedPollen;
      this.currentRiskData = this.calculateRiskLevel(totalPollen);
      
      return this.currentPollenData;
      
    } catch (error) {
      console.error('Error fetching pollen data:', error);
      throw error;
    }
  }
  
  // Get pollen level text based on value
  getPollenLevel(value) {
    if (value >= 8) return 'Very High';
    if (value >= 6) return 'High';
    if (value >= 4) return 'Moderate';
    if (value >= 2) return 'Low';
    return 'None';
  }
  
  // Calculate risk level based on pollen count
  calculateRiskLevel(totalPollen) {
    if (totalPollen >= 20) {
      return {
        level: 'high',
        text: 'High',
        riskClass: 'high-risk',
        healthTip: this.getRandomHealthTip('high'),
        factors: ['Very high pollen count', 'Ideal weather for pollen dispersion']
      };
    } else if (totalPollen >= 10) {
      return {
        level: 'moderate',
        text: 'Moderate',
        riskClass: 'moderate-risk',
        healthTip: this.getRandomHealthTip('medium'),
        factors: ['Moderate pollen count', 'Moderate weather conditions']
      };
    } else {
      return {
        level: 'low',
        text: 'Low',
        riskClass: 'low-risk',
        healthTip: this.getRandomHealthTip('low'),
        factors: ['Low pollen count', 'Favorable conditions']
      };
    }
  }
  
  // Get random health tip for the given level
  getRandomHealthTip(level) {
    const tips = this.healthTips[level] || [];
    return tips[Math.floor(Math.random() * tips.length)] || 'No specific health tips available.';
  }
  
  // Save data to cache
  saveToCache() {
    try {
      const cacheData = {
        location: this.currentLocation,
        weather: this.currentWeatherData,
        pollen: this.currentPollenData,
        risk: this.currentRiskData,
        forecast: this.forecastData,
        timestamp: Date.now()
      };
      
      localStorage.setItem('allergyAppCache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }
  
  // Load data from cache
  loadFromCache() {
    try {
      const cached = localStorage.getItem('allergyAppCache');
      if (!cached) return false;
      
      const { location, weather, pollen, risk, forecast, timestamp } = JSON.parse(cached);
      const cacheAge = Date.now() - timestamp;
      
      // Use cached data if it's less than 1 hour old
      if (cacheAge < 60 * 60 * 1000) {
        this.currentLocation = location || {};
        this.currentWeatherData = weather || {};
        this.currentPollenData = pollen || {};
        this.currentRiskData = risk || {};
        this.forecastData = forecast || [];
        
        // Update UI with cached data
        this.updateUIWithData({
          weather: this.currentWeatherData,
          pollen: this.currentPollenData,
          risk: this.currentRiskData,
          forecast: this.forecastData
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    
    return false;
  }
  
  // Initialize the application
  async init() {
    try {
      // Initialize the UI
      this.initializeUI();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Try to get location from browser first
      if (navigator.geolocation) {
        // Show loading indicator for location
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.textContent = 'Getting your location...';
        
        // Try to get high-accuracy position quickly (up to 2 seconds)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Got location quickly, use it to fetch data
            this.currentLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              // We'll get city name from reverse geocoding in fetchDataWithLocation
            };
            this.loadDataInBackground();
          },
          (error) => {
            // If geolocation fails or is denied, fall back to IP-based location
            console.warn('Geolocation error:', error);
            this.loadDataInBackground();
          },
          {
            enableHighAccuracy: true,  // Try to get best possible location
            timeout: 2000,            // Don't wait too long
            maximumAge: 5 * 60 * 1000 // Accept a cached position from up to 5 minutes ago
          }
        );
      } else {
        // Browser doesn't support geolocation, fall back to IP-based location
        this.loadDataInBackground();
      }
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError("Failed to initialize: " + error.message);
    }
  }
  
  setupEventListeners() {
    // Medication reminder form
    const setReminderBtn = document.getElementById('set-reminder');
    if (setReminderBtn) {
      setReminderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('medication-reminder-text').classList.add('hidden');
        document.getElementById('reminder-form').classList.remove('hidden');
      });
    }
    
    const cancelReminderBtn = document.getElementById('cancel-reminder');
    if (cancelReminderBtn) {
      cancelReminderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideReminderForm();
      });
    }
    
    const saveReminderBtn = document.getElementById('save-reminder');
    if (saveReminderBtn) {
      saveReminderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveReminder();
      });
    }
    
    // Form submission
    document.getElementById("download-csv-btn").addEventListener("click", () => this.downloadCSV())
    document.getElementById("print-report-btn").addEventListener("click", () => this.printReport())
    document.getElementById("email-report-btn").addEventListener("click", () => this.emailReport())
    
    // Severity scale interaction
    const severitySlider = document.getElementById('severity');
    const severityTicks = document.querySelectorAll('.severity-tick');
    const severityValue = document.getElementById('severity-value');
    const severityDescriptions = ['Very Mild', 'Mild', 'Moderate', 'Severe', 'Very Severe'];
    
    // Update slider visual when value changes
    const updateSeverityDisplay = (value) => {
      const percent = ((value - 1) / 4) * 100;
      severityValue.textContent = `${value} - ${severityDescriptions[value - 1]}`;
      
      // Update active tick
      severityTicks.forEach(tick => {
        tick.classList.toggle('active', parseInt(tick.dataset.value) === value);
      });
      
      // Update track fill
      const track = document.querySelector('.severity-slider .track') || 
                   (() => {
                     const track = document.createElement('div');
                     track.className = 'track';
                     document.querySelector('.severity-slider').appendChild(track);
                     return track;
                   })();
      track.style.width = `${percent}%`;
    };
    
    // Handle slider input
    severitySlider.addEventListener('input', (e) => {
      updateSeverityDisplay(parseInt(e.target.value));
    });
    
    // Handle tick clicks
    severityTicks.forEach(tick => {
      tick.addEventListener('click', () => {
        const value = parseInt(tick.dataset.value);
        severitySlider.value = value;
        updateSeverityDisplay(value);
      });
    });
    
    // Initialize display
    updateSeverityDisplay(parseInt(severitySlider.value));
  }

  hideReminderForm() {
    const reminderForm = document.getElementById('reminder-form');
    const reminderText = document.getElementById('medication-reminder-text');
    
    if (reminderForm) reminderForm.classList.add('hidden');
    if (reminderText) reminderText.classList.remove('hidden');
  }
  
  saveReminder() {
    const timeInput = document.getElementById('reminder-time');
    if (!timeInput || !timeInput.value) return;
    
    this.medicationReminderTime = timeInput.value;
    localStorage.setItem('medicationReminderTime', timeInput.value);
    
    const [hours, minutes] = timeInput.value.split(':');
    const timeString = new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const reminderText = document.getElementById('medication-reminder-text');
    if (reminderText) {
      reminderText.innerHTML = `Reminder set for <strong>${timeString}</strong>. <a href="#" id="set-reminder">Change</a>`;
    }
    
    this.hideReminderForm();
    this.showAlert('Reminder set!', `Your medication reminder is set for ${timeString}`, 'low');
  }
  
  loadReminder() {
    const savedTime = localStorage.getItem('medicationReminderTime');
    if (savedTime) {
      this.medicationReminderTime = savedTime;
      const [hours, minutes] = savedTime.split(':');
      const timeString = new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const reminderText = document.getElementById('medication-reminder-text');
      if (reminderText) {
        reminderText.innerHTML = `Reminder set for <strong>${timeString}</strong>. <a href="#" id="set-reminder">Change</a>`;
      }
    }
  }
  
  startReminderCheck() {
    // Clear any existing interval
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }
    
    // Check every minute
    this.reminderInterval = setInterval(() => this.checkReminder(), 60000);
  }
  
  checkReminder() {
    if (!this.medicationReminderTime) return;
    
    const now = new Date();
    const [hours, minutes] = this.medicationReminderTime.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    // Check if current time matches reminder time (within 1 minute)
    if (Math.abs(now - reminderTime) < 60000) {
      this.showMedicationReminder();
    }
  }
  
  showMedicationReminder() {
    // Request notification permission if not already granted
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showNotification();
        }
      });
    } else {
      this.showNotification();
    }
  }
  
  showNotification() {
    // Only show if document is visible
    if (document.visibilityState === 'visible') {
      try {
        const notification = new Notification(' Time for Your Allergy Medication', {
          body: 'This is your scheduled reminder to take your allergy medication.',
          icon: '/favicon.ico'
        });
        
        notification.onclick = () => {
          window.focus();
        };
      } catch (e) {
        console.error('Error showing notification:', e);
      }
    }
  }
  
  initializeUI() {
    // Initialize any UI components that don't require data
    this.setupEventListeners();
    
    // Show loading state immediately
    document.getElementById('loading-text').textContent = 'Initializing...';
    
    // Add loading class to body
    document.body.classList.add('loading');
  }
  
  async loadDataInBackground() {
    try {
      // Show loading state immediately
      const loadingText = document.getElementById('loading-text');
      if (loadingText) loadingText.textContent = 'Loading forecast data...';
      
      // Show demo data immediately
      this.useDemoData();
      
      // Then try to load real data in the background
      try {
        await this.fetchLocationAndAllData();
      } catch (error) {
        console.error('Error in fetchLocationAndAllData:', error);
        // Keep showing demo data if API fails
      }
    } catch (error) {
      console.error("Error in loadDataInBackground:", error);
      // We already showed demo data, so no need to show error
    }
  }

  attachEventListeners() {
    // Form submission
    document.getElementById("download-csv-btn").addEventListener("click", () => this.downloadCSV())
    document.getElementById("print-report-btn").addEventListener("click", () => this.printReport())
    document.getElementById("email-report-btn").addEventListener("click", () => this.emailReport())
    
    // Severity scale interaction
    const severitySlider = document.getElementById('severity');
    const severityTicks = document.querySelectorAll('.severity-tick');
    const severityValue = document.getElementById('severity-value');
    const severityDescriptions = ['Very Mild', 'Mild', 'Moderate', 'Severe', 'Very Severe'];
    
    // Update slider visual when value changes
    const updateSeverityDisplay = (value) => {
      const percent = ((value - 1) / 4) * 100;
      severityValue.textContent = `${value} - ${severityDescriptions[value - 1]}`;
      
      // Update active tick
      severityTicks.forEach(tick => {
        tick.classList.toggle('active', parseInt(tick.dataset.value) === value);
      });
      
      // Update track fill
      const track = document.querySelector('.severity-slider .track') || 
                   (() => {
                     const track = document.createElement('div');
                     track.className = 'track';
                     document.querySelector('.severity-slider').appendChild(track);
                     return track;
                   })();
      track.style.width = `${percent}%`;
    };
    
    // Handle slider input
    severitySlider.addEventListener('input', (e) => {
      updateSeverityDisplay(parseInt(e.target.value));
    });
    
    // Handle tick clicks
    severityTicks.forEach(tick => {
      tick.addEventListener('click', () => {
        const value = parseInt(tick.dataset.value);
        severitySlider.value = value;
        updateSeverityDisplay(value);
      });
    });
    
    // Initialize display
    updateSeverityDisplay(parseInt(severitySlider.value));
  }

  // Save important data to localStorage for persistence
  saveToCache() {
    try {
      const cacheData = {
        location: this.currentLocation,
        weather: this.currentWeatherData,
        forecast: this.forecastData,
        timestamp: Date.now()
      };
      localStorage.setItem('allergyAppCache', JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Failed to save cache to localStorage', e);
    }
  }

  // Load data from localStorage cache
  loadFromCache() {
    try {
      const cached = localStorage.getItem('allergyAppCache');
      if (!cached) return false;
      
      const { location, weather, forecast, timestamp } = JSON.parse(cached);
      const cacheAge = Date.now() - timestamp;
      
      // Use cached data if it's less than 1 hour old
      if (cacheAge < 60 * 60 * 1000) {
        this.currentLocation = location || {};
        this.currentWeatherData = weather || {};
        this.forecastData = forecast || [];
        return true;
      }
    } catch (e) {
      console.warn('Failed to load from cache', e);
    }
    return false;
  }

  // Show demo data immediately while loading real data
  useDemoData() {
    console.log('Using demo data');
    
    // Generate demo forecast data
    const demoForecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const treePollen = Math.floor(Math.random() * 5) + 3;
      const grassPollen = Math.floor(Math.random() * 3) + 1;
      const weedPollen = Math.floor(Math.random() * 7) + 2;
      const totalPollen = treePollen + grassPollen + weedPollen;
      
      demoForecast.push({
        day: i === 0 ? 'Today' : days[date.getDay()],
        dateString: date.toISOString().split('T')[0],
        treePollen,
        grassPollen,
        weedPollen,
        totalPollen,
        temperature: `${Math.floor(18 + Math.random() * 10)}°C`,
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
      });
    }
    
    // Create demo data object
    const demoData = {
      weather: {
        temperature: `${Math.floor(20 + Math.random() * 8)}°C`,
        humidity: `${Math.floor(40 + Math.random() * 40)}%`,
        windSpeed: `${(Math.random() * 10).toFixed(1)} m/s`,
        condition: 'Partly Cloudy',
        city: 'Demo City',
        country: 'Demo Country'
      },
      pollen: {
        tree: 'Medium',
        grass: 'Low',
        weed: 'High',
        treeValue: demoForecast[0].treePollen,
        grassValue: demoForecast[0].grassPollen,
        weedValue: demoForecast[0].weedPollen
      },
      risk: {
        level: 'moderate',
        factors: ['High weed pollen', 'Moderate wind speed'],
        primaryTrigger: 'Weed Pollen',
        healthTip: 'Consider staying indoors with windows closed',
        riskClass: 'moderate-risk',
        text: 'Moderate',
        class: 'moderate'
      },
      forecast: demoForecast
    };
    
    // Update UI with demo data
    this.updateUIWithData(demoData);
    
    // Remove loading state
    document.body.classList.remove('loading');
    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.textContent = '';
    
    console.log('Demo data loaded');
  }

  async fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000, cacheKey } = options;
    
    // Check cache first if cacheKey is provided
    if (cacheKey) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the response if cacheKey is provided
      if (cacheKey) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      clearTimeout(id);
      
      // Return cached data if available when offline
      if (cacheKey) {
        const cached = this.getCache(cacheKey);
        if (cached) {
          console.warn('Using cached data due to network error:', error);
          return cached;
        }
      }
      
      console.error('Fetch error:', error);
      throw error;
    }
  }

  // Show demo data immediately while loading real data
  useDemoData() {
    console.log('Using demo data');
    
    // Generate demo forecast data
    const demoForecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const treePollen = Math.floor(Math.random() * 5) + 3;
      const grassPollen = Math.floor(Math.random() * 3) + 1;
      const weedPollen = Math.floor(Math.random() * 7) + 2;
      const totalPollen = treePollen + grassPollen + weedPollen;
      
      demoForecast.push({
        day: i === 0 ? 'Today' : days[date.getDay()],
        dateString: date.toISOString().split('T')[0],
        treePollen,
        grassPollen,
        weedPollen,
        totalPollen,
        temperature: `${Math.floor(18 + Math.random() * 10)}°C`,
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
      });
    }
    
    // Create demo data object
    const demoData = {
      weather: {
        temperature: `${Math.floor(20 + Math.random() * 8)}°C`,
        humidity: `${Math.floor(40 + Math.random() * 40)}%`,
        windSpeed: `${(Math.random() * 10).toFixed(1)} m/s`,
        condition: 'Partly Cloudy',
        city: 'Demo City',
        country: 'Demo Country'
      },
      pollen: {
        tree: 'Medium',
        grass: 'Low',
        weed: 'High',
        treeValue: demoForecast[0].treePollen,
        grassValue: demoForecast[0].grassPollen,
        weedValue: demoForecast[0].weedPollen
      },
      risk: {
        level: 'moderate',
        factors: ['High weed pollen', 'Moderate wind speed'],
        primaryTrigger: 'Weed Pollen',
        healthTip: 'Consider staying indoors with windows closed',
        riskClass: 'moderate-risk',
        text: 'Moderate',
        class: 'moderate'
      },
      forecast: demoForecast
    };
    
    // Update UI with demo data
    this.updateUIWithData(demoData);
    
    // Remove loading state
    document.body.classList.remove('loading');
    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.textContent = '';
    
    console.log('Demo data loaded');
  }

  async fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000, cacheKey } = options;
    
    // Check cache first if cacheKey is provided
    if (cacheKey) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the response if cacheKey is provided
      if (cacheKey) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      clearTimeout(id);
      
      // Return cached data if available when offline
      if (cacheKey) {
        const cached = this.getCache(cacheKey);
        if (cached) {
          console.warn(`Using cached data due to: ${error.message}`);
          return cached;
        }
      }
      
      throw error;
    }
  }

  async reverseGeocode(lat, lng) {
    try {
      // Use OpenStreetMap Nominatim for reverse geocoding
      const response = await this.fetchWithTimeout(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { timeout: 2000, cacheKey: `geocode_${lat.toFixed(4)}_${lng.toFixed(4)}` }
      );
      
      return {
        city: response.address?.city || response.address?.town || response.address?.village || 'Unknown',
        region: response.address?.state || response.address?.county || 'Unknown',
        country: response.address?.country || 'Unknown',
        latitude: lat,
        longitude: lng
      };
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {
        city: 'Your Location',
        region: '',
        country: '',
        latitude: lat,
        longitude: lng
      };
    }
  }

  async fetchLocationAndAllData() {
    const startTime = performance.now();
    const CACHE_KEY = 'weather_pollen_data';
    
    try {
      // Try to load from cache first
      const cachedData = this.getCachedData(CACHE_KEY);
      if (cachedData) {
        console.log('Using cached data');
        this.updateUIWithData(cachedData);
        return;
      }
      
      // Show loading state
      const alertsContainer = document.getElementById('alerts-container');
      alertsContainer.innerHTML = `
        <div class="loading-small">
          <div class="spinner-small"></div>
          <p>Loading weather and pollen data...</p>
        </div>
      `;

      // If we don't have location yet, get it from IP
      if (!this.currentLocation?.latitude) {
        const locationResponse = await this.fetchWithTimeout("https://ipapi.co/json/");
        if (!locationResponse.ok) {
          throw new Error("Failed to fetch location");
        }
        const locationData = await locationResponse.json();

        if (locationData.error) {
          throw new Error(locationData.reason || "Location service error");
        }

        this.currentLocation = {
          city: locationData.city,
          region: locationData.region,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };
      } else {
        // We have coordinates but need city name
        const locationInfo = await this.reverseGeocode(
          this.currentLocation.latitude,
          this.currentLocation.longitude
        );
        this.currentLocation = { ...this.currentLocation, ...locationInfo };
      }

      // Step 2: Fetch current weather and 7-day pollen forecast in parallel
      // with error handling for each request
      const [weatherData, forecastData] = await Promise.allSettled([
        this.fetchWeatherData(this.currentLocation.latitude, this.currentLocation.longitude),
        this.fetch7DayPollenForecast(this.currentLocation.latitude, this.currentLocation.longitude)
      ]);

      // Handle any failed requests
      const errors = [weatherData, forecastData]
        .filter(result => result.status === 'rejected')
        .map(result => result.reason.message || 'Unknown error');
      
      if (errors.length > 0) {
        console.warn('Some data failed to load:', errors);
      }

      // Process successful responses
      const weather = weatherData.status === 'fulfilled' ? weatherData.value : null;
      const forecast = forecastData.status === 'fulfilled' ? forecastData.value : null;

      // If we have no data, throw an error
      if (!weather && !forecast) {
        throw new Error('Failed to load weather and forecast data');
      }

      // Use simulated data if API calls failed
      this.forecastData = forecast || this.generateSimulated7DayForecast();
      
      this.currentWeatherData = {
        temperature: weather ? Math.round(weather.main.temp) : Math.floor(Math.random() * 15) + 15, // Random temp 15-30°C if no data
        humidity: weather ? weather.main.humidity : Math.floor(Math.random() * 30) + 40, // 40-70%
        windSpeed: weather ? weather.wind.speed : (Math.random() * 5).toFixed(1), // 0-5 m/s
        treePollen: this.forecastData[0]?.treePollen || 0,
        grassPollen: this.forecastData[0]?.grassPollen || 0,
        weedPollen: this.forecastData[0]?.weedPollen || 0,
        overallPollen: this.forecastData[0]?.totalPollen || 0,
        weatherCondition: weather?.weather?.[0]?.main || 'Clear',
        windDirection: weather ? this.getWindDirection(weather.wind.deg) : 'N/A'
      };

      // Generate and display alerts with the data we have
      this.generateAlerts(this.currentWeatherData, this.forecastData);

      // Process and display comprehensive data
      this.displayComprehensiveData(this.currentLocation, this.currentWeatherData, this.forecastData);
      
      const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`Data loaded in ${loadTime} seconds`);
      
    } catch (error) {
      console.error("Error:", error);
      this.showError(error.message);
      
      // Show error in alerts container
      const alertsContainer = document.getElementById('alerts-container');
      alertsContainer.innerHTML = `
        <div class="alert-item high">
          <span class="alert-icon">⚠️</span>
          <div class="alert-content">
            <h4>Unable to load alerts</h4>
            <p>${error.message || 'Please check your internet connection and refresh the page.'}</p>
          </div>
        </div>
      `;
    }
  }
  
  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 22.5) % 16;
    return directions[index];
  }
  
  generateAlerts(weatherData, forecastData) {
    this.alerts = [];
    const today = forecastData[0];
    
    // High pollen alert
    if (today.totalPollen >= 8) {
      this.alerts.push({
        type: 'high',
        title: 'High Pollen Alert',
        message: 'Pollen levels are very high today. Consider taking precautions if you have allergies.',
        icon: '🌼'
      });
    } else if (today.totalPollen >= 5) {
      this.alerts.push({
        type: 'medium',
        title: 'Moderate Pollen Alert',
        message: 'Pollen levels are moderate today. Be mindful if you have allergies.',
        icon: '🌾'
      });
    }
    
    // Wind alert (wind spreads pollen)
    if (weatherData.windSpeed > 20) {
      this.alerts.push({
        type: 'medium',
        title: 'Windy Conditions',
        message: `Winds are strong (${weatherData.windSpeed} m/s from ${weatherData.windDirection}), which may spread pollen more easily.`,
        icon: '💨'
      });
    }
    
    // Weather condition alerts
    if (weatherData.weatherCondition === 'Rain') {
      this.alerts.push({
        type: 'low',
        title: 'Rain Alert',
        message: 'Rain can help clear pollen from the air, providing temporary relief.',
        icon: '🌧️'
      });
    } else if (weatherData.weatherCondition === 'Clear') {
      this.alerts.push({
        type: 'medium',
        title: 'Clear Skies',
        message: 'Dry, clear conditions may lead to higher pollen counts later in the day.',
        icon: '☀️'
      });
    }
    
    // Add health tips based on pollen level
    const tipLevel = today.totalPollen >= 8 ? 'high' : today.totalPollen >= 5 ? 'medium' : 'low';
    const randomTip = this.healthTips[tipLevel][Math.floor(Math.random() * this.healthTips[tipLevel].length)];
    
    this.alerts.push({
      type: 'low',
      title: 'Health Tip',
      message: randomTip,
      icon: '💡'
    });
    
    // Display alerts
    this.displayAlerts();
  }
  
  displayAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    
    if (this.alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div class="alert-item low">
          <span class="alert-icon">✅</span>
          <div class="alert-content">
            <h4>No Active Alerts</h4>
            <p>Pollen and weather conditions are currently favorable.</p>
          </div>
        </div>
      `;
      return;
    }
    
    alertsContainer.innerHTML = this.alerts.map(alert => `
      <div class="alert-item ${alert.type}">
        <span class="alert-icon">${alert.icon}</span>
        <div class="alert-content">
          <h4>${alert.title}</h4>
          <p>${alert.message}</p>
        </div>
      </div>
    `).join('');
  }
  
  showAlert(title, message, type = 'low') {
    const alert = document.createElement('div');
    alert.className = `alert-item ${type}`;
    alert.innerHTML = `
      <span class="alert-icon">${type === 'high' ? '⚠️' : type === 'medium' ? 'ℹ️' : '✅'}</span>
      <div class="alert-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;
    
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.insertBefore(alert, alertsContainer.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }

  async fetchWeatherData(latitude, longitude) {
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.weatherApiKey}&units=metric`
      const response = await fetch(weatherUrl)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch weather data')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching weather data:', error)
      throw new Error('Unable to connect to weather service. Please try again later.')
    }
  }

  async fetch7DayPollenForecast(latitude, longitude) {
    // For demo purposes, we'll simulate 7-day pollen forecast data
    // In production, use real API calls to services like Ambee or similar
    return this.generateSimulated7DayForecast()
  }

  generateSimulated7DayForecast() {
    const forecast = []
    const currentMonth = new Date().getMonth()
    const baseMultiplier = this.getSeasonalMultiplier(currentMonth)

    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)

      // Add some realistic variation and trends
      const dayVariation = 0.7 + Math.random() * 0.6 // 0.7 to 1.3
      const trendFactor = this.getTrendFactor(i, currentMonth)

      const treePollen = Math.floor(Math.random() * 80 * baseMultiplier * dayVariation * trendFactor)
      const grassPollen = Math.floor(Math.random() * 50 * baseMultiplier * dayVariation * trendFactor)
      const weedPollen = Math.floor(Math.random() * 30 * baseMultiplier * dayVariation * trendFactor)

      forecast.push({
        date: date,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        dateString: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        treePollen: Math.max(0, treePollen),
        grassPollen: Math.max(0, grassPollen),
        weedPollen: Math.max(0, weedPollen),
        totalPollen: Math.max(0, treePollen + grassPollen + weedPollen),
      })
    }

    return forecast
  }

  getSeasonalMultiplier(month) {
    if (month >= 2 && month <= 5) return 2.5 // Spring
    if (month >= 6 && month <= 8) return 1.8 // Summer
    if (month >= 9 && month <= 10) return 1.2 // Fall
    return 0.3 // Winter
  }

  getTrendFactor(dayIndex, month) {
    // Simulate realistic pollen trends
    if (month >= 2 && month <= 5) {
      // Spring - generally increasing
      return 0.8 + dayIndex * 0.1
    } else if (month >= 6 && month <= 8) {
      // Summer - stable with variations
      return 0.9 + Math.sin(dayIndex) * 0.2
    } else if (month >= 9 && month <= 10) {
      // Fall - generally decreasing
      return 1.2 - dayIndex * 0.1
    }
    return 1 // Winter - stable low
  }

  displayComprehensiveData(location, weatherData, forecastData) {
    // Update location and current conditions
    document.getElementById("city-name").textContent = `📍 ${location.city}, ${location.region}, ${location.country}`
    document.getElementById("temperature").textContent = `${weatherData.temperature}°C`
    document.getElementById("humidity").textContent = `${weatherData.humidity}%`
    document.getElementById("wind-speed").textContent = `${weatherData.windSpeed} m/s`

    // Update today's pollen data
    this.displayTodayPollenData(forecastData[0])

    // Display 7-day forecast
    this.displayForecastData(forecastData)

    // Create interactive chart
    this.createPollenChart(forecastData)

    // Analyze and display trends
    const trendAnalysis = this.analyzeTrends(forecastData)

    // Calculate enhanced allergy risk for today
    this.currentRiskData = this.calculateEnhancedAllergyRisk(
      weatherData.humidity,
      weatherData.windSpeed,
      weatherData.treePollen,
      weatherData.grassPollen,
      weatherData.weedPollen,
      forecastData,
    )
    this.displayEnhancedAllergyRisk(this.currentRiskData)

    // Generate AI summary
    this.generateAISummary(this.currentWeatherData, forecastData, this.currentRiskData)

    // Show content and hide loading
    this.showContent()
  }

  displayTodayPollenData(todayData) {
    document.getElementById("tree-pollen").textContent = todayData.treePollen
    document.getElementById("tree-pollen").className = `pollen-level ${this.getPollenLevelClass(todayData.treePollen)}`

    document.getElementById("grass-pollen").textContent = todayData.grassPollen
    document.getElementById("grass-pollen").className =
      `pollen-level ${this.getPollenLevelClass(todayData.grassPollen)}`

    document.getElementById("weed-pollen").textContent = todayData.weedPollen
    document.getElementById("weed-pollen").className = `pollen-level ${this.getPollenLevelClass(todayData.weedPollen)}`

    document.getElementById("overall-pollen").textContent = todayData.totalPollen
    document.getElementById("overall-pollen").className =
      `pollen-index ${this.getPollenLevelClass(todayData.totalPollen)}`
  }

  displayForecastData(forecastData) {
    const forecastContainer = document.getElementById("forecast-cards")
    forecastContainer.innerHTML = ""

    forecastData.forEach((day, index) => {
      const card = document.createElement("div")
      card.className = `forecast-card ${index === 0 ? "selected" : ""}`
      card.onclick = () => this.selectForecastDay(index)

      const riskLevel = this.calculateDayRiskLevel(day.totalPollen)

      card.innerHTML = `
                <div class="forecast-day">${index === 0 ? "Today" : day.day}</div>
                <div class="forecast-date">${day.dateString}</div>
                <div class="forecast-pollen-mini">
                    <div class="mini-pollen">
                        <div class="mini-pollen-type">🌳</div>
                        <div class="mini-pollen-value ${this.getPollenLevelClass(day.treePollen)}">${day.treePollen}</div>
                    </div>
                    <div class="mini-pollen">
                        <div class="mini-pollen-type">🌱</div>
                        <div class="mini-pollen-value ${this.getPollenLevelClass(day.grassPollen)}">${day.grassPollen}</div>
                    </div>
                    <div class="mini-pollen">
                        <div class="mini-pollen-type">🌿</div>
                        <div class="mini-pollen-value ${this.getPollenLevelClass(day.weedPollen)}">${day.weedPollen}</div>
                    </div>
                </div>
                <div class="forecast-risk ${riskLevel.class}">${riskLevel.text}</div>
            `

      forecastContainer.appendChild(card)
    })
  }

  selectForecastDay(index) {
    // Update selected card visual
    document.querySelectorAll(".forecast-card").forEach((card, i) => {
      card.classList.toggle("selected", i === index)
    })

    this.selectedDay = index
    // You could update detailed view here if needed
  }

  createPollenChart(forecastData) {
    const canvas = document.getElementById("pollen-chart")
    const ctx = canvas.getContext("2d")

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Find max values for scaling
    const maxPollen = Math.max(...forecastData.map((d) => Math.max(d.treePollen, d.grassPollen, d.weedPollen)))

    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw pollen lines
    this.drawPollenLine(
      ctx,
      forecastData,
      "treePollen",
      this.chartColors.tree,
      padding,
      chartWidth,
      chartHeight,
      maxPollen,
    )
    this.drawPollenLine(
      ctx,
      forecastData,
      "grassPollen",
      this.chartColors.grass,
      padding,
      chartWidth,
      chartHeight,
      maxPollen,
    )
    this.drawPollenLine(
      ctx,
      forecastData,
      "weedPollen",
      this.chartColors.weed,
      padding,
      chartWidth,
      chartHeight,
      maxPollen,
    )

    // Draw day labels
    ctx.fillStyle = "#666"
    ctx.font = "12px Inter, sans-serif" // Use Inter font
    ctx.textAlign = "center"
    forecastData.forEach((day, index) => {
      const x = padding + (chartWidth / (forecastData.length - 1)) * index
      ctx.fillText(day.day, x, height - 10)
    })

    // Draw y-axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      const value = Math.round(maxPollen * (1 - i / 5))
      ctx.fillText(value.toString(), padding - 10, y + 4)
    }
  }

  drawPollenLine(ctx, data, pollenType, color, padding, chartWidth, chartHeight, maxPollen) {
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()

    data.forEach((day, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y = padding + chartHeight - (day[pollenType] / maxPollen) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Draw data points
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    ctx.stroke()
  }

  analyzeTrends(forecastData) {
    const totalPollens = forecastData.map((d) => d.totalPollen)
    const firstHalf = totalPollens.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    const secondHalf = totalPollens.slice(4, 7).reduce((a, b) => a + b, 0) / 3

    let trendClass, trendDescription
    const difference = secondHalf - firstHalf
    const percentChange = firstHalf === 0 ? 0 : (difference / firstHalf) * 100 // Handle division by zero

    if (percentChange > 15) {
      trendClass = "trend-up"
      trendDescription = `📈 Rising trend (+${Math.round(percentChange)}%)`
    } else if (percentChange < -15) {
      trendClass = "trend-down"
      trendDescription = `📉 Declining trend (${Math.round(percentChange)}%)`
    } else {
      trendClass = "trend-stable"
      trendDescription = "📊 Stable levels expected"
    }

    // Find peak day
    const maxIndex = totalPollens.indexOf(Math.max(...totalPollens))
    const peakDay = forecastData[maxIndex].day === "Today" ? "Today" : forecastData[maxIndex].day

    return { trendClass, trendDescription, peakDay }
  }

  calculateDayRiskLevel(totalPollen) {
    if (totalPollen > 150) return { text: "Extreme", class: "risk-extreme" }
    if (totalPollen > 100) return { text: "High", class: "risk-high" }
    if (totalPollen > 60) return { text: "Moderate", class: "risk-moderate" }
    return { text: "Low", class: "risk-low" }
  }

  getPollenLevelClass(count) {
    if (count <= 10) return "pollen-very-low"
    if (count <= 30) return "pollen-low"
    if (count <= 60) return "pollen-moderate"
    if (count <= 100) return "pollen-high"
    return "pollen-very-high"
  }

  calculateEnhancedAllergyRisk(humidity, windSpeed, treePollen, grassPollen, weedPollen, forecastData) {
    let riskScore = 0
    let riskLevel, riskClass, healthTip, primaryTrigger

    // Weather-based risk factors
    if (humidity < 30 && windSpeed > 5) riskScore += 30
    else if (humidity < 50 && windSpeed > 3) riskScore += 20
    else riskScore += 5

    // Current pollen-based risk factors
    const totalPollen = treePollen + grassPollen + weedPollen
    if (totalPollen > 150) riskScore += 50
    else if (totalPollen > 100) riskScore += 40
    else if (totalPollen > 60) riskScore += 30
    else if (totalPollen > 30) riskScore += 20
    else riskScore += 5

    // Future trend consideration
    const avgFuturePollen = forecastData.slice(1, 4).reduce((sum, day) => sum + day.totalPollen, 0) / 3
    if (avgFuturePollen > totalPollen * 1.2) riskScore += 10 // Increasing trend

    // Determine primary trigger
    const maxPollen = Math.max(treePollen, grassPollen, weedPollen)
    if (treePollen === maxPollen && treePollen > 20) {
      primaryTrigger = "🌳 Tree pollen is the primary trigger"
    } else if (grassPollen === maxPollen && grassPollen > 20) {
      primaryTrigger = "🌱 Grass pollen is the primary trigger"
    } else if (weedPollen === maxPollen && weedPollen > 20) {
      primaryTrigger = "🌿 Weed pollen is the primary trigger"
    } else {
      primaryTrigger = "🌤️ Weather conditions are the main factor"
    }

    // Determine overall risk level with forecast consideration
    if (riskScore >= 80) {
      riskLevel = "Extreme Risk"
      riskClass = "risk-extreme"
      healthTip =
        "🚨 CRITICAL ALERT! Extremely high pollen levels with worsening conditions ahead. Stay indoors, seal windows, use HEPA filters, and consult your doctor about preventive medication."
    } else if (riskScore >= 60) {
      riskLevel = "High Risk"
      riskClass = "risk-high"
      healthTip =
        "⚠️ HIGH POLLEN ALERT! Wear N95 masks outdoors, keep windows closed, shower after outdoor exposure, and consider starting allergy medications early."
    } else if (riskScore >= 35) {
      riskLevel = "Moderate Risk"
      riskClass = "risk-moderate"
      healthTip =
        "⚡ Moderate risk with potential increases ahead. Limit outdoor activities during peak hours (10am-4pm), keep car windows up, and monitor symptoms closely."
    } else {
      riskLevel = "Low Risk"
      riskClass = "risk-low"
      healthTip =
        "✅ Favorable conditions for outdoor activities! Low pollen levels expected to continue. Great time for exercise and outdoor recreation."
    }

    return { riskLevel, riskClass, healthTip, primaryTrigger }
  }

  displayEnhancedAllergyRisk({ riskLevel, riskClass, healthTip, primaryTrigger }) {
    const riskElement = document.getElementById("risk-level")
    const tipElement = document.getElementById("health-tip")
    const triggerElement = document.getElementById("primary-trigger")

    riskElement.textContent = riskLevel
    riskElement.className = `risk-badge ${riskClass}`
    tipElement.textContent = healthTip
    triggerElement.textContent = primaryTrigger
  }

  async generateAISummary(weatherData, forecastData, riskData) {
    const aiSummaryLoading = document.getElementById("ai-summary-loading")
    const aiSummaryTextElement = document.getElementById("ai-summary-text")
    const aiSummaryError = document.getElementById("ai-summary-error")

    aiSummaryLoading.classList.remove("hidden")
    aiSummaryTextElement.classList.add("hidden")
    aiSummaryError.classList.add("hidden")

    try {
      // Note: This fetch assumes you have a Next.js API route set up at /api/allergy-summary
      // If running as pure HTML/CSS/JS, this will not work without a backend.
      const response = await fetch("/api/allergy-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weatherData, forecastData, riskData }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.aiSummaryText = data.summary // Store the summary
      aiSummaryTextElement.textContent = this.aiSummaryText
      aiSummaryTextElement.classList.remove("hidden")
    } catch (error) {
      console.error("Error fetching AI summary:", error)
      aiSummaryError.classList.remove("hidden")
      this.aiSummaryText = "AI summary could not be generated." // Default for sharing
    } finally {
      aiSummaryLoading.classList.add("hidden")
    }
  }

  // New: Download forecast data as CSV
  downloadCSV() {
    if (this.forecastData.length === 0) {
      alert("No forecast data available to download.")
      return
    }

    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Date,Day,Tree Pollen,Grass Pollen,Weed Pollen,Total Pollen,Risk Level\n"

    this.forecastData.forEach((day) => {
      const risk = this.calculateDayRiskLevel(day.totalPollen)
      csvContent += `${day.dateString},${day.day},${day.treePollen},${day.grassPollen},${day.weedPollen},${day.totalPollen},${risk.text}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `allergy_forecast_${this.currentLocation.city || "data"}.csv`)
    document.body.appendChild(link) // Required for Firefox
    link.click()
    document.body.removeChild(link) // Clean up
  }

  // New: Print/Save as PDF the current report view
  printReport() {
    window.print()
  }

  // New: Share report via email
  emailReport() {
    const subject = `Allergy Forecast Report for ${this.currentLocation.city}, ${this.currentLocation.country}`

    let body = `Hello,\n\n`
    body += `Here is your Smart Allergy Forecast Report for ${this.currentLocation.city}, ${this.currentLocation.country}:\n\n`
    body += `--- Current Conditions ---\n`
    body += `Temperature: ${this.currentWeatherData.temperature}°C\n`
    body += `Humidity: ${this.currentWeatherData.humidity}%\n`
    body += `Wind Speed: ${this.currentWeatherData.windSpeed} m/s\n`
    body += `Today's Tree Pollen: ${this.currentWeatherData.treePollen}\n`
    body += `Today's Grass Pollen: ${this.currentWeatherData.grassPollen}\n`
    body += `Today's Weed Pollen: ${this.currentWeatherData.weedPollen}\n`
    body += `Today's Overall Pollen Index: ${this.currentWeatherData.overallPollen}\n`
    body += `Current Allergy Risk: ${this.currentRiskData.riskLevel}\n`
    body += `Primary Trigger: ${this.currentRiskData.primaryTrigger}\n`
    body += `Health Tip: ${this.currentRiskData.healthTip}\n\n`

    body += `--- 7-Day Pollen Forecast ---\n`
    this.forecastData.forEach((day) => {
      const risk = this.calculateDayRiskLevel(day.totalPollen)
      body += `${day.day} (${day.dateString}): Tree: ${day.treePollen}, Grass: ${day.grassPollen}, Weed: ${day.weedPollen}, Total: ${day.totalPollen}, Risk: ${risk.text}\n`
    })
    body += `\n`

    if (this.aiSummaryText) {
      body += `--- AI Allergy Insights ---\n`
      body += `${this.aiSummaryText}\n\n`
    }

    body += `Generated by Smart Allergy Forecast App (V0).\n`

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
  }

  showContent() {
    document.getElementById("loading").classList.add("hidden")
    document.getElementById("content").classList.remove("hidden")
  }

  showError(message) {
    document.getElementById("loading").classList.add("hidden")
    document.getElementById("error-message").textContent = message
    document.getElementById("error").classList.remove("hidden")
  }
}

// Initialize the advanced app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const app = new AdvancedAllergyForecastApp();
  
  // Signal to the landing page that we're ready
  if (window.parent !== window && window.parent.window.appReady) {
    window.parent.window.appReady();
  }
})
