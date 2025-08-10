import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useLocation } from '../context/LocationContext';
import { getWeatherData, getPollenData } from '../services/weatherService';

interface ForecastData {
  weather: {
    temp: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  pollen: {
    grass_pollen: number;
    tree_pollen: number;
    weed_pollen: number;
    overall_aqi: number;
  };
  timestamp: number;
}

const ForecastPage: React.FC = () => {
  const { location, refreshLocation, setManualLocation, isLoading } = useLocation();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialForecast = async () => {
      if (isLoading) return;
      
      setIsFetching(true);
      setError(null);
      
      try {
        // First refresh location
        await refreshLocation();
        
        // Then fetch forecast data
        const [weather, pollen] = await Promise.all([
          getWeatherData(location.latitude, location.longitude),
          getPollenData(location.latitude, location.longitude)
        ]);
        
        setForecast({
          weather,
          pollen,
          timestamp: Date.now()
        });
      } catch (err) {
        console.error('Error loading forecast:', err);
        setError('Failed to load forecast data. Please try refreshing.');
      } finally {
        setIsFetching(false);
      }
    };
    
    loadInitialForecast();
  }, []);

  const refreshForecast = async () => {
    if (isLoading || isFetching) return;
    
    setIsFetching(true);
    setError(null);
    
    try {
      // Refresh location first
      await refreshLocation();
      
      // Then fetch fresh forecast data
      const [weather, pollen] = await Promise.all([
        getWeatherData(location.latitude, location.longitude),
        getPollenData(location.latitude, location.longitude)
      ]);
      
      setForecast({
        weather,
        pollen,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Error refreshing forecast:', err);
      setError('Failed to update forecast. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleRefresh = async () => {
    await refreshLocation();
    await refreshForecast();
  };

  const getPollenLevel = (level: number): string => {
    if (level <= 1) return 'Low';
    if (level <= 3) return 'Moderate';
    if (level <= 4) return 'High';
    return 'Very High';
  };

  const getAqiLevel = (aqi: number): { level: string; color: string } => {
    if (aqi <= 50) return { level: 'Good', color: 'text-green-500' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-500' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500' };
    return { level: 'Very Unhealthy', color: 'text-purple-500' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Detecting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className={`flex items-center text-indigo-600 hover:text-indigo-800 transition-colors ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Updating...' : 'Refresh'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Allergy Forecast</h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <FiMapPin className="mr-1" />
                  <span>{location?.name || 'Unknown Location'}</span>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className={`text-sm text-indigo-600 hover:text-indigo-800 flex items-center ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FiRefreshCw className={`mr-1 text-xs ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Updating...' : 'Update Location'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 p-4 text-red-600 flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}

          {isFetching && !forecast ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your forecast...</p>
            </div>
          ) : forecast ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Weather Impact Card */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4">Weather Impact on Allergies</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        {forecast.weather.icon.includes('01') && '☀️'}
                        {forecast.weather.icon.includes('02') && '⛅'}
                        {forecast.weather.icon.includes('03') && '☁️'}
                        {forecast.weather.icon.includes('04') && '☁️'}
                        {forecast.weather.icon.includes('09') && '🌧️'}
                        {forecast.weather.icon.includes('10') && '🌦️'}
                        {forecast.weather.icon.includes('11') && '⛈️'}
                        {forecast.weather.icon.includes('13') && '❄️'}
                        {forecast.weather.icon.includes('50') && '🌫️'}
                      </div>
                      <div>
                        <p className="font-medium">{Math.round(forecast.weather.temp)}°C • {forecast.weather.description}</p>
                        <p className="text-sm text-gray-600">
                          Humidity: {forecast.weather.humidity}% • Wind: {forecast.weather.windSpeed} m/s
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-1">Today's Allergy Impact:</h4>
                      {forecast.weather.humidity < 40 && (
                        <p className="text-sm text-gray-700">Low humidity may make pollen stay airborne longer.</p>
                      )}
                      {forecast.weather.humidity > 70 && (
                        <p className="text-sm text-gray-700">High humidity can make mold spores more active.</p>
                      )}
                      {forecast.weather.windSpeed > 15 && (
                        <p className="text-sm text-gray-700">Windy conditions can spread pollen further.</p>
                      )}
                      {forecast.weather.icon.includes('09') || forecast.weather.icon.includes('10') ? (
                        <p className="text-sm text-gray-700">Rain helps clear pollen from the air temporarily.</p>
                      ) : (
                        <p className="text-sm text-gray-700">Dry conditions may increase pollen counts.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pollen & Allergy Card */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Pollen & Allergy Information</h3>
                  <div className="space-y-4">
                    {/* Pollen Levels */}
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-3">Current Pollen Levels:</h4>
                      
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Tree Pollen</span>
                          <span className={`text-sm font-semibold ${getPollenLevel(forecast.pollen.tree_pollen) === 'High' || getPollenLevel(forecast.pollen.tree_pollen) === 'Very High' ? 'text-red-600' : 'text-gray-700'}`}>
                            {getPollenLevel(forecast.pollen.tree_pollen)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getPollenLevel(forecast.pollen.tree_pollen) === 'High' || getPollenLevel(forecast.pollen.tree_pollen) === 'Very High' ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${(forecast.pollen.tree_pollen / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Grass Pollen</span>
                          <span className={`text-sm font-semibold ${getPollenLevel(forecast.pollen.grass_pollen) === 'High' || getPollenLevel(forecast.pollen.grass_pollen) === 'Very High' ? 'text-red-600' : 'text-gray-700'}`}>
                            {getPollenLevel(forecast.pollen.grass_pollen)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getPollenLevel(forecast.pollen.grass_pollen) === 'High' || getPollenLevel(forecast.pollen.grass_pollen) === 'Very High' ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${(forecast.pollen.grass_pollen / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Weed Pollen</span>
                          <span className={`text-sm font-semibold ${getPollenLevel(forecast.pollen.weed_pollen) === 'High' || getPollenLevel(forecast.pollen.weed_pollen) === 'Very High' ? 'text-red-600' : 'text-gray-700'}`}>
                            {getPollenLevel(forecast.pollen.weed_pollen)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getPollenLevel(forecast.pollen.weed_pollen) === 'High' || getPollenLevel(forecast.pollen.weed_pollen) === 'Very High' ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${(forecast.pollen.weed_pollen / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Air Quality Index</span>
                          <span className={`text-sm font-semibold ${getAqiLevel(forecast.pollen.overall_aqi).color}`}>
                            {forecast.pollen.overall_aqi} - {getAqiLevel(forecast.pollen.overall_aqi).level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Allergy Prevention Tips */}
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Allergy Prevention Tips:</h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Keep windows closed during high pollen counts
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Shower after being outdoors to remove pollen
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Use HEPA filters in your home
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Wear sunglasses to protect your eyes
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Consider taking antihistamines before going outside
                        </li>
                      </ul>
                    </div>

                    {/* Peak Pollen Times */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Peak Pollen Times:</h4>
                      <p className="text-sm text-gray-700">
                        Pollen counts are typically highest between 5-10 AM and at dusk. 
                        Try to schedule outdoor activities for other times of day.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Allergy Management Section */}
              <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergy Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Indoor Air Quality */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Indoor Air Quality
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1.5">
                        <li>• Use a HEPA air purifier</li>
                        <li>• Keep humidity between 30-50%</li>
                        <li>• Clean with a damp cloth</li>
                        <li>• Vacuum with HEPA filter</li>
                      </ul>
                    </div>

                    {/* Medication Reminder */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Medication Reminder
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">Consider taking your allergy medication at these times:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white p-2 rounded text-center">
                          <div className="font-medium">Morning</div>
                          <div className="text-xs text-gray-500">7:00 AM</div>
                        </div>
                        <div className="bg-white p-2 rounded text-center">
                          <div className="font-medium">Evening</div>
                          <div className="text-xs text-gray-500">7:00 PM</div>
                        </div>
                      </div>
                    </div>

                    {/* Pollen Hotspots */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Local Pollen Hotspots
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">Areas to be cautious about:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>• Parks</span>
                          <span className="text-red-500 font-medium">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Gardens</span>
                          <span className="text-red-500 font-medium">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Fields</span>
                          <span className="text-yellow-500 font-medium">Moderate</span>
                        </div>
                      </div>
                    </div>

                    {/* Allergy Diary */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Allergy Diary
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">Track your symptoms to identify triggers:</p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="sneezing" className="rounded text-blue-500 mr-2" />
                          <label htmlFor="sneezing" className="text-sm text-gray-700">Sneezing</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="itchyEyes" className="rounded text-blue-500 mr-2" />
                          <label htmlFor="itchyEyes" className="text-sm text-gray-700">Itchy/Watery Eyes</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="congestion" className="rounded text-blue-500 mr-2" />
                          <label htmlFor="congestion" className="text-sm text-gray-700">Nasal Congestion</label>
                        </div>
                      </div>
                      <button className="mt-2 w-full bg-white text-sm text-purple-600 font-medium py-1 px-3 rounded border border-purple-200 hover:bg-purple-50 transition-colors">
                        Save Symptoms
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p>No forecast data available. Please try refreshing.</p>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Last updated: {forecast ? new Date(forecast.timestamp).toLocaleString() : 'Never'}</p>
          <p className="mt-2">Data provided by OpenWeatherMap</p>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
