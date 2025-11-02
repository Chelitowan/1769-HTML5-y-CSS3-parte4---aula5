import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trip, PriceConfig, Location } from '../types';
import { StorageService } from '../services/storage';
import { LocationService } from '../services/location';
import { SharingService } from '../services/sharing';
import { calculateTotalPrice, calculateDistance } from '../utils/calculations';
import * as ExpoLocation from 'expo-location';

interface TripContextType {
  currentTrip: Trip | null;
  priceConfig: PriceConfig;
  tripHistory: Trip[];
  isLoading: boolean;
  createTrip: (origin: Location, destination: Location, distance: number, estimatedTime: number) => Promise<Trip>;
  startTrip: (tripId: string) => Promise<void>;
  completeTrip: (tripId: string) => Promise<void>;
  updatePriceConfig: (config: PriceConfig) => Promise<void>;
  shareTrip: (trip: Trip) => Promise<boolean>;
  loadHistory: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [priceConfig, setPriceConfig] = useState<PriceConfig>({
    basePrice: 50,
    pricePerKm: 10,
    pricePerMinute: 5,
  });
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationSubscription, setLocationSubscription] = useState<ExpoLocation.LocationSubscription | null>(null);

  useEffect(() => {
    loadInitialData();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [savedConfig, savedTrip, history] = await Promise.all([
        StorageService.getPriceConfig(),
        StorageService.getCurrentTrip(),
        StorageService.getTripHistory(),
      ]);

      setPriceConfig(savedConfig);
      setCurrentTrip(savedTrip);
      setTripHistory(history);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTrip = async (
    origin: Location,
    destination: Location,
    distance: number,
    estimatedTime: number
  ): Promise<Trip> => {
    const totalPrice = calculateTotalPrice(distance, estimatedTime, priceConfig);
    const shareToken = SharingService.generateShareToken();

    const trip: Trip = {
      id: Date.now().toString(),
      origin,
      destination,
      distance,
      estimatedTime,
      priceConfig: { ...priceConfig },
      totalPrice,
      status: 'pending',
      createdAt: Date.now(),
      shareToken,
    };

    setCurrentTrip(trip);
    await StorageService.saveCurrentTrip(trip);
    return trip;
  };

  const startTrip = async (tripId: string) => {
    if (!currentTrip || currentTrip.id !== tripId) return;

    const currentLocation = await LocationService.getCurrentLocation();
    const updatedTrip: Trip = {
      ...currentTrip,
      status: 'active',
      startedAt: Date.now(),
      currentLocation: currentLocation || currentTrip.origin,
    };

    setCurrentTrip(updatedTrip);
    await StorageService.saveCurrentTrip(updatedTrip);

    // Start watching location
    const subscription = await LocationService.watchPosition((location) => {
      setCurrentTrip((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, currentLocation: location };
        StorageService.saveCurrentTrip(updated);
        return updated;
      });
    });

    if (subscription) {
      setLocationSubscription(subscription);
    }
  };

  const completeTrip = async (tripId: string) => {
    if (!currentTrip || currentTrip.id !== tripId) return;

    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    const completedTrip: Trip = {
      ...currentTrip,
      status: 'completed',
      completedAt: Date.now(),
    };

    await StorageService.addTripToHistory(completedTrip);
    await StorageService.saveCurrentTrip(null);
    setCurrentTrip(null);
    await loadHistory();
  };

  const updatePriceConfig = async (config: PriceConfig) => {
    setPriceConfig(config);
    await StorageService.savePriceConfig(config);
  };

  const shareTrip = async (trip: Trip): Promise<boolean> => {
    if (!trip.shareToken) return false;
    return await SharingService.shareTrackingLink(trip.shareToken, trip.totalPrice);
  };

  const loadHistory = async () => {
    const history = await StorageService.getTripHistory();
    setTripHistory(history);
  };

  return (
    <TripContext.Provider
      value={{
        currentTrip,
        priceConfig,
        tripHistory,
        isLoading,
        createTrip,
        startTrip,
        completeTrip,
        updatePriceConfig,
        shareTrip,
        loadHistory,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within TripProvider');
  }
  return context;
};
