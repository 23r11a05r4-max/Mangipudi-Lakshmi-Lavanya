import { worldCities, City } from '../data/cities';

/**
 * Calculates the distance between two geo-coordinates using the Haversine formula.
 * @returns Distance in kilometers.
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Finds the nearest city from a predefined list based on latitude and longitude.
 * This simulates reverse geocoding for the purpose of grouping votes by city.
 * @returns The name of the nearest city or a coordinate string as a fallback.
 */
export const findNearestCity = (latitude: number, longitude: number): string => {
  if (latitude === null || longitude === null) {
    return 'Unknown';
  }

  let nearestCity: City | null = null;
  let minDistance = Infinity;

  worldCities.forEach(city => {
    const distance = calculateDistance(latitude, longitude, city.latitude, city.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });
  
  // If the nearest city is more than 500km away, it's likely not the user's city.
  // This threshold helps avoid incorrect city assignments for users in remote areas.
  if (nearestCity && minDistance < 500) {
    return nearestCity.name;
  }
  
  // Fallback for remote locations not covered by our city list.
  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
};
