import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandStorage } from '@/utils/storage';
import { Settings } from '@/types';

interface SettingsState extends Settings {
  setUnits: (units: 'metric' | 'imperial') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  reset: () => void;
}

const defaultSettings: Settings = {
  units: 'metric',
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  theme: 'dark',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setUnits: (units) =>
        set({
          units,
          temperatureUnit: units === 'metric' ? 'celsius' : 'fahrenheit',
          windSpeedUnit: units === 'metric' ? 'kmh' : 'mph',
        }),

      setTheme: (theme) => set({ theme }),

      reset: () => set(defaultSettings),
    }),
    {
      name: 'weather-settings',
      storage: createJSONStorage(() => createZustandStorage()),
    }
  )
);
