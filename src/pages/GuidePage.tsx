import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiDroplet, FiWind, FiSun } from 'react-icons/fi';

const GuidePage: React.FC = () => {
  const navigate = useNavigate();

  const tips = [
    {
      icon: <FiAlertCircle className="text-2xl text-yellow-500" />,
      title: 'Check Daily Forecasts',
      description: 'Check pollen counts in the morning and plan outdoor activities when counts are lower.'
    },
    {
      icon: <FiDroplet className="text-2xl text-blue-500" />,
      title: 'Keep Windows Closed',
      description: 'Keep windows and doors closed during high pollen seasons to reduce indoor exposure.'
    },
    {
      icon: <FiWind className="text-2xl text-green-500" />,
      title: 'Use Air Purifiers',
      description: 'Consider using HEPA air purifiers to reduce indoor pollen levels.'
    },
    {
      icon: <FiSun className="text-2xl text-orange-500" />,
      title: 'Wear Sunglasses',
      description: 'Wear sunglasses to protect your eyes from pollen when outdoors.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-8 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Pollen Allergy Guide</h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about managing your pollen allergies effectively.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {tips.map((tip, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                  <p className="text-gray-600">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-indigo-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">Ready for Your Personalized Forecast?</h2>
          <p className="text-gray-700 mb-6">
            Get real-time pollen levels and personalized recommendations for your specific location.
          </p>
          <button
            onClick={() => navigate('/forecast')}
            className="btn btn-primary px-8 py-3 text-lg"
          >
            Get Your Pollen Forecast
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
