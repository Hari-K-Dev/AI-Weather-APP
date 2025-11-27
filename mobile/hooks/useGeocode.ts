import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { GeoLocation } from '@/types';

export function useGeocode(query: string, enabled: boolean = true) {
  const result = useQuery<GeoLocation[]>({
    queryKey: ['geocode', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await api.searchCities(query);
      return response.results;
    },
    enabled: enabled && query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    results: result.data || [],
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
