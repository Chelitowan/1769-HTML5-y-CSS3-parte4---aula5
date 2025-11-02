import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, PriceConfig } from '../types';
import { DEFAULT_PRICE_CONFIG } from '../utils/constants';

const KEYS = {
  TRIP_HISTORY: '@motoquero:trip_history',
  PRICE_CONFIG: '@motoquero:price_config',
  CURRENT_TRIP: '@motoquero:current_trip',
};

export const StorageService = {
  async saveTripHistory(trips: Trip[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TRIP_HISTORY, JSON.stringify(trips));
    } catch (error) {
      console.error('Error saving trip history:', error);
    }
  },

  async getTripHistory(): Promise<Trip[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRIP_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting trip history:', error);
      return [];
    }
  },

  async addTripToHistory(trip: Trip): Promise<void> {
    try {
      const history = await this.getTripHistory();
      const updatedHistory = [trip, ...history].slice(0, 50); // Keep last 50 trips
      await this.saveTripHistory(updatedHistory);
    } catch (error) {
      console.error('Error adding trip to history:', error);
    }
  },

  async savePriceConfig(config: PriceConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PRICE_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving price config:', error);
    }
  },

  async getPriceConfig(): Promise<PriceConfig> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PRICE_CONFIG);
      return data ? JSON.parse(data) : DEFAULT_PRICE_CONFIG;
    } catch (error) {
      console.error('Error getting price config:', error);
      return DEFAULT_PRICE_CONFIG;
    }
  },

  async saveCurrentTrip(trip: Trip | null): Promise<void> {
    try {
      if (trip) {
        await AsyncStorage.setItem(KEYS.CURRENT_TRIP, JSON.stringify(trip));
      } else {
        await AsyncStorage.removeItem(KEYS.CURRENT_TRIP);
      }
    } catch (error) {
      console.error('Error saving current trip:', error);
    }
  },

  async getCurrentTrip(): Promise<Trip | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CURRENT_TRIP);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current trip:', error);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.TRIP_HISTORY,
        KEYS.PRICE_CONFIG,
        KEYS.CURRENT_TRIP,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
