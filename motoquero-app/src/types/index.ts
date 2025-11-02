export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface PriceConfig {
  basePrice: number;
  pricePerKm: number;
  pricePerMinute: number;
}

export interface Trip {
  id: string;
  origin: Location;
  destination: Location;
  distance: number;
  estimatedTime: number;
  priceConfig: PriceConfig;
  totalPrice: number;
  status: 'pending' | 'active' | 'completed';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  currentLocation?: Location;
  shareToken?: string;
}

export interface TripHistory {
  trips: Trip[];
}
