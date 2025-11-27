import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useWeatherStore } from '@/store';
import { AQIData } from '@/types';

export function useAQI() {
  const { currentLocation, setCachedAQI, cachedAQI } = useWeatherStore();

  const query = useQuery<AQIData>({
    queryKey: ['aqi', currentLocation.lat, currentLocation.lon],
    queryFn: async () => {
      const data = await api.getAQI(currentLocation.lat, currentLocation.lon);
      setCachedAQI(data);
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: cachedAQI || undefined,
  });

  return {
    aqi: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
