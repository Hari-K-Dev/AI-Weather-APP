// Weather Types
export interface CurrentWeather {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  weather_code: number;
  description: string;
  icon: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weather_code: number;
  precipitation_probability: number;
}

export interface DailyForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  weather_code: number;
  description: string;
  precipitation_probability: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  location: string;
  lat: number;
  lon: number;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezone: string;
  updated_at: string;
}

// Geocoding Types
export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface GeocodeResponse {
  results: GeoLocation[];
}

// AQI Types
export interface AQIData {
  aqi: number;
  category: string;
  dominant_pollutant?: string;
  pm25?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  available: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: number;
}

export interface Citation {
  source: string;
  content: string;
  score: number;
}

export interface ChatRequest {
  message: string;
  history: { role: string; content: string }[];
  location?: string;
  lat?: number;
  lon?: number;
}

// Settings Types
export interface Settings {
  units: 'metric' | 'imperial';
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  theme: 'dark' | 'light';
}

// Location Types
export interface SavedLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  isDefault?: boolean;
}

// Health Types
export interface HealthStatus {
  status: string;
  ollama: boolean;
  qdrant: boolean;
  timestamp: string;
}
