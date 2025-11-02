import { PriceConfig } from '../types';

export const calculateTotalPrice = (
  distance: number,
  estimatedTime: number,
  config: PriceConfig
): number => {
  const distancePrice = distance * config.pricePerKm;
  const timePrice = estimatedTime * config.pricePerMinute;
  const total = config.basePrice + distancePrice + timePrice;
  return Math.round(total * 100) / 100;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatDistance = (distance: number): string => {
  return `${distance.toFixed(2)} km`;
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}min`;
};
