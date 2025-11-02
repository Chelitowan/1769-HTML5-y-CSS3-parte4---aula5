import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Button, Card } from '../components';
import { useTrip } from '../contexts/TripContext';
import { COLORS } from '../utils/constants';
import { formatCurrency, formatDistance, formatTime } from '../utils/calculations';

export const TripScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentTrip, startTrip, completeTrip, shareTrip } = useTrip();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentTrip) {
      navigation.navigate('Home' as never);
    }
  }, [currentTrip]);

  if (!currentTrip) return null;

  const handleStartTrip = async () => {
    setIsLoading(true);
    try {
      await startTrip(currentTrip.id);
      Alert.alert('Viaje Iniciado', '¡El seguimiento en tiempo real está activo!');
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el viaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareTrip = async () => {
    const success = await shareTrip(currentTrip);
    if (success) {
      Alert.alert('Enlace Compartido', 'El enlace de seguimiento ha sido compartido');
    } else {
      Alert.alert('Error', 'No se pudo compartir el enlace');
    }
  };

  const handleCompleteTrip = async () => {
    Alert.alert(
      'Completar Viaje',
      '¿Estás seguro de que deseas finalizar este viaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await completeTrip(currentTrip.id);
              Alert.alert('Viaje Completado', '¡Viaje finalizado exitosamente!');
              navigation.navigate('Home' as never);
            } catch (error) {
              Alert.alert('Error', 'No se pudo completar el viaje');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const mapRegion = {
    latitude: currentTrip.currentLocation?.latitude || currentTrip.origin.latitude,
    longitude: currentTrip.currentLocation?.longitude || currentTrip.origin.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const getStatusText = () => {
    switch (currentTrip.status) {
      case 'pending':
        return '⏳ Pendiente';
      case 'active':
        return '🚀 En Curso';
      case 'completed':
        return '✅ Completado';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (currentTrip.status) {
      case 'pending':
        return COLORS.textSecondary;
      case 'active':
        return COLORS.accent;
      case 'completed':
        return COLORS.success;
      default:
        return COLORS.text;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            customMapStyle={darkMapStyle}
          >
            <Marker
              coordinate={currentTrip.origin}
              title="Origen"
              pinColor={COLORS.accent}
            />
            <Marker
              coordinate={currentTrip.destination}
              title="Destino"
              pinColor={COLORS.success}
            />
            {currentTrip.currentLocation && (
              <Marker
                coordinate={currentTrip.currentLocation}
                title="Ubicación Actual"
                pinColor={COLORS.accent}
              >
                <View style={styles.currentMarker}>
                  <Text style={styles.markerText}>🏍️</Text>
                </View>
              </Marker>
            )}
            <Polyline
              coordinates={[currentTrip.origin, currentTrip.destination]}
              strokeColor={COLORS.accent}
              strokeWidth={3}
            />
          </MapView>
        </View>

        <ScrollView style={styles.detailsContainer}>
          <Card>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Estado:</Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>📊 Detalles del Viaje</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distancia:</Text>
              <Text style={styles.detailValue}>
                {formatDistance(currentTrip.distance)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tiempo estimado:</Text>
              <Text style={styles.detailValue}>
                {formatTime(currentTrip.estimatedTime)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Precio base:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(currentTrip.priceConfig.basePrice)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Por kilómetro:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(currentTrip.priceConfig.pricePerKm)}/km
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Por minuto:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(currentTrip.priceConfig.pricePerMinute)}/min
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(currentTrip.totalPrice)}
              </Text>
            </View>
          </Card>

          {currentTrip.status === 'pending' && (
            <>
              <Button
                title="🚀 Iniciar Viaje"
                onPress={handleStartTrip}
                loading={isLoading}
              />
              <Button
                title="📤 Compartir Enlace"
                onPress={handleShareTrip}
                variant="outline"
                style={styles.shareButton}
              />
            </>
          )}

          {currentTrip.status === 'active' && (
            <>
              <Button
                title="📤 Compartir Enlace"
                onPress={handleShareTrip}
                variant="outline"
              />
              <Button
                title="✅ Completar Viaje"
                onPress={handleCompleteTrip}
                loading={isLoading}
                style={styles.completeButton}
              />
            </>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 El enlace compartido permite al cliente rastrear tu ubicación en tiempo
              real durante el viaje.
            </Text>
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentMarker: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    padding: 8,
  },
  markerText: {
    fontSize: 24,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 28,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  shareButton: {
    marginTop: 12,
  },
  completeButton: {
    marginTop: 12,
    backgroundColor: COLORS.success,
  },
  infoBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
