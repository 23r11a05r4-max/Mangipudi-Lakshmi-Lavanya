export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

// An expanded list of major world cities for mock reverse geocoding
export const worldCities: City[] = [
  // Asia
  { name: 'Tokyo', latitude: 35.6895, longitude: 139.6917 },
  { name: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
  { name: 'Shanghai', latitude: 31.2304, longitude: 121.4737 },
  { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
  { name: 'Dhaka', latitude: 23.8103, longitude: 90.4125 },
  { name: 'Karachi', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Manila', latitude: 14.5995, longitude: 120.9842 },
  { name: 'Seoul', latitude: 37.5665, longitude: 126.9780 },
  { name: 'Jakarta', latitude: -6.2088, longitude: 106.8456 },
  { name: 'Bangkok', latitude: 13.7563, longitude: 100.5018 },
  { name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Karimnagar', latitude: 18.4386, longitude: 79.1288 },
  
  // Europe
  { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Moscow', latitude: 55.7558, longitude: 37.6173 },
  { name: 'London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
  { name: 'Rome', latitude: 41.9028, longitude: 12.4964 },

  // North America
  { name: 'Mexico City', latitude: 19.4326, longitude: -99.1332 },
  { name: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
  { name: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
  { name: 'Toronto', latitude: 43.6532, longitude: -79.3832 },

  // South America
  { name: 'São Paulo', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816 },
  { name: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
  { name: 'Bogotá', latitude: 4.7110, longitude: -74.0721 },
  { name: 'Lima', latitude: -12.0464, longitude: -77.0428 },

  // Africa
  { name: 'Lagos', latitude: 6.5244, longitude: 3.3792 },
  { name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Kinshasa', latitude: -4.4419, longitude: 15.2663 },
  { name: 'Johannesburg', latitude: -26.2041, longitude: 28.0473 },
  { name: 'Nairobi', latitude: -1.2921, longitude: 36.8219 },
  
  // Oceania
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Melbourne', latitude: -37.8136, longitude: 144.9631 },
  { name: 'Auckland', latitude: -36.8485, longitude: 174.7633 },
];