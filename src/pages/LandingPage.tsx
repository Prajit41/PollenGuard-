import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 mb-6">
          Breathe Easier with <span className="text-indigo-600">PollenGuard</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Get personalized pollen forecasts and allergy information based on your location. 
          Stay ahead of your allergies with real-time updates and expert recommendations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/guide')}
            className="btn btn-primary flex items-center justify-center gap-2 text-lg"
          >
            View Guide <FiArrowRight className="inline" />
          </button>
          
          <button
            onClick={() => navigate('/forecast')}
            className="btn btn-secondary text-lg"
          >
            Get Personalized Forecast
          </button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🌡️',
              title: 'Real-time Data',
              description: 'Get up-to-date pollen counts and weather information for your exact location.'
            },
            {
              icon: '📱',
              title: 'Personalized Alerts',
              description: 'Receive notifications when pollen levels are high in your area.'
            },
            {
              icon: '🤧',
              title: 'Allergy Management',
              description: 'Track symptoms, get prevention tips, and manage your allergies effectively.'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
