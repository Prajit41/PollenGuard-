import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import GuidePage from './pages/GuidePage';
import ForecastPage from './pages/ForecastPage';
import { LocationProvider } from './context/LocationContext';
import './styles/global.css';

function App() {
  return (
    <LocationProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/forecast" element={<ForecastPage />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </LocationProvider>
  );
}

export default App;
