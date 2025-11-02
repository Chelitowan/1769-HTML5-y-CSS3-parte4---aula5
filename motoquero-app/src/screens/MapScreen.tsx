import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Button, Card } from '../components';
import { useTrip } from '../contexts/TripContext';
import { LocationService } from '../services/location';
import { Location } from '../types';
import { COLORS } from '../utils/constants';
import { calculateDistance, formatCurrency, formatDistance, formatTime } from '../utils/calculations';

export const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const { priceConfig, createTrip } = useTrip();

  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [selectingOrigin, setSelectingOrigin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
    const location = await LocationService.getCurrentLocation();
    if (location) {
      setCurrentLocation(location);
      setOrigin(location);
    } else {
      Alert.alert(
        'Permisos de Ubicación',
        'Necesitamos acceso a tu ubicación para mostrar el mapa'
      );
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const location: Location = { latitude, longitude };

    if (selectingOrigin) {
      setOrigin(location);
      setSelectingOrigin(false);
    } else {
      setDestination(location);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      if (selectingOrigin) {
        setOrigin(currentLocation);
        setSelectingOrigin(false);
      } else {
        setDestination(currentLocation);
      }
    }
  };

  const handleSwapPoints = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleReset = () => {
    setOrigin(currentLocation);
    setDestination(null);
    setSelectingOrigin(true);
  };

  const calculateTripDetails = () => {
    if (!origin || !destination) return null;

    const distance = calculateDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );

    const estimatedTime = Math.round(distance * 3);
    const totalPrice =
      priceConfig.basePrice +
      distance * priceConfig.pricePerKm +
      estimatedTime * priceConfig.pricePerMinute;

    return { distance, estimatedTime, totalPrice };
  };

  const handleCreateTrip = async () => {
    if (!origin || !destination) {
      Alert.alert('Error', 'Selecciona origen y destino');
      return;
    }

    setIsLoading(true);
    try {
      const details = calculateTripDetails();
      if (!details) return;

      const trip = await createTrip(
        origin,
        destination,
        details.distance,
        details.estimatedTime
      );

      navigation.navigate('Trip' as never);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el viaje');
    } finally {
      setIsLoading(false);
    }
  };

  const tripDetails = calculateTripDetails();
  const mapRegion = origin
    ? {
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            onPress={handleMapPress}
            customMapStyle={darkMapStyle}
          >
            {origin && (
              <Marker
                coordinate={origin}
                title="Origen"
                pinColor={COLORS.accent}
              />
            )}
            {destination && (
              <Marker
                coordinate={destination}
                title="Destino"
                pinColor={COLORS.success}
              />
            )}
            {origin && destination && (
              <Polyline
                coordinates={[origin, destination]}
                strokeColor={COLORS.accent}
                strokeWidth={3}
              />
            )}
          </MapView>
        )}

        <View style={styles.overlay}>
          <Card style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              {selectingOrigin
                ? '📍 Toca el mapa para seleccionar el ORIGEN'
                : '🎯 Toca el mapa para seleccionar el DESTINO'}
            </Text>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Text style={styles.currentLocationText}>
                📱 Usar mi ubicación actual
              </Text>
            </TouchableOpacity>
          </Card>

          {tripDetails && (
            <Card style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distancia:</Text>
                <Text style={styles.detailValue}>{formatDistance(tripDetails.distance)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tiempo estimado:</Text>
                <Text style={styles.detailValue}>{formatTime(tripDetails.estimatedTime)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(tripDetails.totalPrice)}
                </Text>
              </View>
            </Card>
          )}

          <View style={styles.buttonContainer}>
            {destination && (
              <Button
                title="🔄 Intercambiar"
                onPress={handleSwapPoints}
                variant="secondary"
                style={styles.smallButton}
              />
            )}
            <Button
              title="🗑️ Reiniciar"
              onPress={handleReset}
              variant="secondary"
              style={styles.smallButton}
            />
          </View>

          <Button
            title="✅ Crear Viaje"
            onPress={handleCreateTrip}
            disabled={!origin || !destination}
            loading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  instructionCard: {
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  currentLocationButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentLocationText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  smallButton: {
    flex: 1,
  },
});
