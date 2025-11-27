import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useWeatherStore, useSettingsStore } from '@/store';
import { WeatherData } from '@/types';

// Default location to use immediately (New York)
const DEFAULT_LAT = 40.7128;
const DEFAULT_LON = -74.006;

export function useWeather() {
  const { currentLocation, setCachedWeather, cachedWeather } = useWeatherStore();
  const { units } = useSettingsStore();

  // Use default coords if store hasn't hydrated yet
  const lat = currentLocation?.lat ?? DEFAULT_LAT;
  const lon = currentLocation?.lon ?? DEFAULT_LON;

  const query = useQuery<WeatherData>({
    queryKey: ['weather', lat, lon, units],
    queryFn: async () => {
      console.log('Fetching weather for:', lat, lon, units);
      const data = await api.getWeather(lat, lon, units);
      setCachedWeather(data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: true,
  });

  return {
    weather: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
