
import { useState, useEffect } from 'react';
import { GeolocationState } from '../types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(l => ({ ...l, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setLocation(l => ({ ...l, error: `Error retrieving location: ${error.message}` }));
    };

    const watcher = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  return { location, error: location.error };
};
