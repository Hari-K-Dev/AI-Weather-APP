export const Colors = {
  // Background colors
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  surfaceHighlight: '#2A2A2A',

  // Primary colors
  primary: '#22C55E',
  primaryLight: '#4ADE80',
  primaryDark: '#16A34A',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',

  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // AQI colors
  aqiGood: '#22C55E',
  aqiModerate: '#F59E0B',
  aqiUnhealthySensitive: '#F97316',
  aqiUnhealthy: '#EF4444',
  aqiVeryUnhealthy: '#A855F7',
  aqiHazardous: '#7C2D12',

  // Weather condition colors
  sunny: '#FCD34D',
  cloudy: '#9CA3AF',
  rainy: '#60A5FA',
  stormy: '#6366F1',
  snowy: '#E5E7EB',

  // Border colors
  border: '#333333',
  borderLight: '#444444',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 64,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return Colors.aqiGood;
  if (aqi <= 100) return Colors.aqiModerate;
  if (aqi <= 150) return Colors.aqiUnhealthySensitive;
  if (aqi <= 200) return Colors.aqiUnhealthy;
  if (aqi <= 300) return Colors.aqiVeryUnhealthy;
  return Colors.aqiHazardous;
}

export function getWeatherIcon(code: number): string {
  const icons: Record<number, string> = {
    0: '☀️',
    1: '🌤️',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌧️',
    53: '🌧️',
    55: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    66: '🌨️',
    67: '🌨️',
    71: '🌨️',
    73: '🌨️',
    75: '❄️',
    77: '🌨️',
    80: '🌦️',
    81: '🌦️',
    82: '⛈️',
    85: '🌨️',
    86: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️',
  };
  return icons[code] || '❓';
}
