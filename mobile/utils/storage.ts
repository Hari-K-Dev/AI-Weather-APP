import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Platform-agnostic storage utility
 * Uses localStorage on web, AsyncStorage on native
 */
class StorageService {
  private isWeb = Platform.OS === 'web';

  async getItem(key: string): Promise<string | null> {
    if (this.isWeb) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('localStorage not available:', e);
      }
      return;
    }
    return AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (this.isWeb) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
      return;
    }
    return AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (this.isWeb) {
      try {
        localStorage.clear();
      } catch {
        // Ignore
      }
      return;
    }
    return AsyncStorage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    if (this.isWeb) {
      try {
        return Object.keys(localStorage);
      } catch {
        return [];
      }
    }
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  }
}

export const storage = new StorageService();

/**
 * Create a Zustand-compatible storage object
 */
export const createZustandStorage = () => ({
  getItem: async (name: string) => {
    const value = await storage.getItem(name);
    return value;
  },
  setItem: async (name: string, value: string) => {
    await storage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await storage.removeItem(name);
  },
});

export default storage;
