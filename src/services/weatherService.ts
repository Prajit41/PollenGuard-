import axios from 'axios';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pressure: number;
}

interface PollenData {
  grass_pollen: number;
  tree_pollen: number;
  weed_pollen: number;
  overall_aqi: number;
}

// Generate mock pollen data based on weather conditions
const generateMockPollenData = (weather: WeatherData): PollenData => {
  // Higher humidity generally means lower pollen
  const humidityFactor = 1 - (weather.humidity / 100) * 0.7; // 0.3 to 1.0
  // Higher wind can spread pollen more but also disperse it
  const windFactor = Math.min(weather.windSpeed / 5, 1.5); // 0.2 to 1.5
  // Higher pressure often means clearer skies (better for pollen)
  const pressureFactor = (weather.pressure / 1013) * 0.5 + 0.5; // 0.7 to 1.2
  
  // Base levels
  const baseLevel = humidityFactor * windFactor * pressureFactor;
  
  // Different types of pollen have different seasons
  const now = new Date();
  const month = now.getMonth();
  
  // Adjust factors based on season (northern hemisphere)
  const treeFactor = 1 + Math.sin((month - 2) * Math.PI / 6) * 0.8; // Peaks in spring (March-May)
  const grassFactor = 0.5 + Math.sin((month - 5) * Math.PI / 6) * 0.5; // Peaks in summer (June-August)
  const weedFactor = 0.3 + Math.sin((month - 8) * Math.PI / 6) * 0.7; // Peaks in fall (September-November)
  
  // Generate values from 1-5 based on conditions
  return {
    grass_pollen: Math.min(5, Math.max(1, Math.round(grassFactor * baseLevel * 5))),
    tree_pollen: Math.min(5, Math.max(1, Math.round(treeFactor * baseLevel * 4))),
    weed_pollen: Math.min(5, Math.max(1, Math.round(weedFactor * baseLevel * 3))),
    // AQI from 20-150 based on conditions (20-50 good, 51-100 moderate, 101-150 unhealthy for sensitive groups)
    overall_aqi: Math.min(150, Math.max(20, Math.round(20 + 130 * (1 - humidityFactor * 0.7 + weather.windSpeed / 20)))),
  };
};

export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    return {
      temp: response.data.main.temp,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      pressure: response.data.main.pressure,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return default weather data if API call fails
    return {
      temp: 22,
      humidity: 65,
      windSpeed: 3,
      pressure: 1013,
      description: 'clear sky',
      icon: '01d',
    };
  }
};

export const getPollenData = async (lat: number, lon: number): Promise<PollenData> => {
  try {
    // First get weather data to generate realistic pollen data
    const weather = await getWeatherData(lat, lon);
    // Generate mock pollen data based on current weather
    return generateMockPollenData(weather);
  } catch (error) {
    console.error('Error generating pollen data:', error);
    // Return default pollen data if there's an error
    return {
      grass_pollen: 3,
      tree_pollen: 2,
      weed_pollen: 1,
      overall_aqi: 60,
    };
  }
};

export const getLocationName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PollenGuard/1.0 (your@email.com)' // Required by Nominatim's usage policy
        }
      }
    );
    return response.data.display_name.split(',').slice(0, 3).join(',');
  } catch (error) {
    console.error('Error getting location name:', error);
    return 'Your Location';
  }
};
