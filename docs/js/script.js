class AdvancedAllergyForecastApp {
  constructor() {
    this.weatherApiKey = "bd78e54d0186477047d25911103391ab";
    this.pollenApiKey = "";
    this.forecastData = [];
    this.selectedDay = 0;
    this.chart = null;
    this.currentLocation = {}; // Store location data
    this.currentWeatherData = {}; // Store current weather data
    this.currentRiskData = {}; // Store current risk data
    this.aiSummaryText = ""; // Store AI summary text
    this.medicationReminderTime = null;
    this.reminderInterval = null;
    this.alerts = [];
    this.cache = new Map(); // Simple in-memory cache
    this.CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes cache expiry

    // Define chart colors to match new palette
    this.chartColors = {
      tree: "#8B4513", // Brownish for tree
      grass: "#32CD32", // Green for grass
      weed: "#DAA520", // Yellowish for weed
    };

    // Health tips based on pollen levels
    this.healthTips = {
      high: [
        "Consider staying indoors with windows closed",
        "Wear sunglasses to protect your eyes",
        "Shower after being outside to remove pollen",
        "Use air purifiers with HEPA filters",
        "Take allergy medication as prescribed"
      ],
      medium: [
        "Keep windows closed during peak pollen hours",
        "Wash your face and hands after being outside",
        "Use saline nasal rinses to clear pollen",
        "Change clothes after being outdoors"
      ],
      low: [
        "Enjoy the outdoors but be aware of symptoms",
        "Keep track of your allergy symptoms",
        "Stay hydrated to help with allergies"
      ]
    };

    // Initialize with cached data if available
    this.loadFromCache();
    this.init();
  }

  async init() {
    try {
      // Show main content immediately
      const contentElement = document.getElementById('content');
      if (contentElement) {
        contentElement.classList.remove('hidden');
      }
      
      // Initialize the UI
      this.initializeUI();
      
      // Try to get location from browser first
      if (navigator.geolocation) {
        // Show loading indicator for location
        document.getElementById('loading-text').textContent = 'Getting your location...';
        
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
    const severityInput = document.getElementById('severity');
    const severityValue = document.getElementById('severity-value');
    
    if (severityInput && severityValue) {
      const severityTexts = ['Very Mild', 'Mild', 'Moderate', 'Severe', 'Very Severe'];
      
      const updateSeverityText = () => {
        const value = parseInt(severityInput.value);
        if (severityValue) {
          severityValue.textContent = `${value} - ${severityTexts[value - 1]}`;
        }
      };
      
      severityInput.addEventListener('input', updateSeverityText);
      updateSeverityText();
    }
      
      console.log('Form initialization complete');
      this.attachEventListeners();
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError("Failed to initialize: " + error.message);
    }
  }
  
  async loadDataInBackground() {
    try {
      // Load data in the background
      await this.fetchLocationAndAllData();
    } catch (error) {
      console.error("Error loading data:", error);
      this.showError("Failed to load data. Please try again later.");
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

  // Simple in-memory cache with expiry
  setCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_EXPIRY
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
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
      if (!cached) return;
      
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
    
    try {
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
  new AdvancedAllergyForecastApp()
})
