import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Platform-aware configuration
 */
interface AppConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  isDev: boolean;
  platform: 'web' | 'ios' | 'android';
}

const getApiBaseUrl = (): string => {
  // Check for environment variable first
  const envUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (envUrl) return envUrl;

  // Development defaults
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:8000';
    }
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 for localhost
      // Real device needs actual IP or localhost with adb reverse
      return 'http://localhost:8000';
    }
    // iOS simulator can use localhost
    return 'http://localhost:8000';
  }

  // Production - should be configured via environment
  return 'https://api.weatherai.app';
};

const getWsBaseUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/^http/, 'ws');
};

export const config: AppConfig = {
  apiBaseUrl: getApiBaseUrl(),
  wsBaseUrl: getWsBaseUrl(),
  isDev: __DEV__,
  platform: Platform.OS as 'web' | 'ios' | 'android',
};

export default config;
