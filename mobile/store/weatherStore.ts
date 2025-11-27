import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandStorage } from '@/utils/storage';
import { SavedLocation, WeatherData, AQIData } from '@/types';

interface WeatherState {
  currentLocation: SavedLocation;
  setCurrentLocation: (location: SavedLocation) => void;
  savedLocations: SavedLocation[];
  addSavedLocation: (location: SavedLocation) => void;
  removeSavedLocation: (name: string) => void;
  cachedWeather: WeatherData | null;
  setCachedWeather: (data: WeatherData) => void;
  cachedAQI: AQIData | null;
  setCachedAQI: (data: AQIData) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const defaultLocation: SavedLocation = {
  name: 'New York',
  lat: 40.7128,
  lon: -74.006,
  country: 'United States',
  state: 'New York',
  isDefault: true,
};

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      currentLocation: defaultLocation,
      setCurrentLocation: (location) => set({ currentLocation: location }),
      savedLocations: [defaultLocation],
      addSavedLocation: (location) => {
        const existing = get().savedLocations;
        if (!existing.find((l) => l.name === location.name)) {
          set({ savedLocations: [...existing, location] });
        }
      },
      removeSavedLocation: (name) => {
        set({
          savedLocations: get().savedLocations.filter((l) => l.name !== name),
        });
      },
      cachedWeather: null,
      setCachedWeather: (data) => set({ cachedWeather: data }),
      cachedAQI: null,
      setCachedAQI: (data) => set({ cachedAQI: data }),
      recentSearches: [],
      addRecentSearch: (query) => {
        const existing = get().recentSearches.filter((q) => q !== query);
        set({ recentSearches: [query, ...existing].slice(0, 10) });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'weather-store',
      storage: createJSONStorage(() => createZustandStorage()),
    }
  )
);
