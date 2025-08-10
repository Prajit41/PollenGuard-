import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Location {
  latitude: number;
  longitude: number;
  name: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  error?: string;
}

interface LocationContextType {
  location: Location;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<boolean>;
  setManualLocation: (location: { latitude: number; longitude: number; name: string }) => void;
}

// Default to null location - we'll force IP detection
const nullLocation: Location = {
  latitude: 0,
  longitude: 0,
  name: 'Locating...',
  city: '',
  region: '',
  country: '',
  postalCode: ''
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location>(nullLocation);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getIPLocation = async (): Promise<Location> => {
    try {
      // First try ip-api.com with more detailed response
      const ipApiResponse = await axios.get('http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query');
      
      if (ipApiResponse.data.status === 'success') {
        const { lat, lon, city, regionName, country, zip } = ipApiResponse.data;
        const locationName = [
          city,
          regionName,
          country,
          zip ? `Postal: ${zip}` : ''
        ].filter(Boolean).join(', ');

        return {
          latitude: lat,
          longitude: lon,
          name: locationName,
          city,
          region: regionName,
          country,
          postalCode: zip
        };
      }
      
      // Fallback to ipapi.co if ip-api fails
      const ipapiResponse = await axios.get('https://ipapi.co/json/');
      
      if (ipapiResponse.data.latitude && ipapiResponse.data.longitude) {
        const { latitude, longitude, city, region, country_name, country_code, postal } = ipapiResponse.data;
        const locationName = [
          city,
          region,
          country_name,
          postal ? `Postal: ${postal}` : ''
        ].filter(Boolean).join(', ');

        return {
          latitude,
          longitude,
          name: locationName,
          city,
          region,
          country: country_name,
          postalCode: postal
        };
      }
      
      throw new Error('Both IP location services failed');
      
    } catch (error) {
      console.error('Error getting IP location:', error);
      throw new Error('Failed to get precise location. Please check your internet connection.');
    }
  };

  const refreshLocation = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newLocation = await getIPLocation();
      setLocation(newLocation);
      
      // Check if we got a valid location
      if (newLocation.latitude === 0 && newLocation.longitude === 0) {
        throw new Error('Invalid location received');
      }
      
      console.log('Location updated:', newLocation);
      toast.success(`Location set to ${newLocation.name}`);
      return true;
      
    } catch (err) {
      console.error('Error refreshing location:', err);
      const errorMsg = 'Failed to get precise location. Using last known location.';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setManualLocation = (loc: { latitude: number; longitude: number; name: string }) => {
    setLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      name: loc.name
    });
    toast.success(`Location set to ${loc.name}`);
  };

  // Get user's location on mount
  useEffect(() => {
    refreshLocation();
  }, []);

  return (
    <LocationContext.Provider 
      value={{ 
        location,
        isLoading, 
        error, 
        refreshLocation,
        setManualLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
