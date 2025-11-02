import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input, Card } from '../components';
import { useTrip } from '../contexts/TripContext';
import { COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/calculations';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { priceConfig, updatePriceConfig, currentTrip } = useTrip();

  const [basePrice, setBasePrice] = useState(priceConfig.basePrice.toString());
  const [pricePerKm, setPricePerKm] = useState(priceConfig.pricePerKm.toString());
  const [pricePerMinute, setPricePerMinute] = useState(priceConfig.pricePerMinute.toString());

  useEffect(() => {
    setBasePrice(priceConfig.basePrice.toString());
    setPricePerKm(priceConfig.pricePerKm.toString());
    setPricePerMinute(priceConfig.pricePerMinute.toString());
  }, [priceConfig]);

  const handleSaveConfig = async () => {
    const config = {
      basePrice: parseFloat(basePrice) || 0,
      pricePerKm: parseFloat(pricePerKm) || 0,
      pricePerMinute: parseFloat(pricePerMinute) || 0,
    };

    if (config.basePrice < 0 || config.pricePerKm < 0 || config.pricePerMinute < 0) {
      Alert.alert('Error', 'Los precios no pueden ser negativos');
      return;
    }

    await updatePriceConfig(config);
    Alert.alert('Éxito', 'Configuración de precios guardada');
  };

  const handleNewTrip = () => {
    navigation.navigate('Map' as never);
  };

  const handleContinueTrip = () => {
    navigation.navigate('Trip' as never);
  };

  const estimatedTotal = () => {
    const base = parseFloat(basePrice) || 0;
    const perKm = parseFloat(pricePerKm) || 0;
    const perMin = parseFloat(pricePerMinute) || 0;
    const exampleDistance = 10;
    const exampleTime = 20;
    return base + perKm * exampleDistance + perMin * exampleTime;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏍️ MOTOQUERO</Text>
          <Text style={styles.subtitle}>Presupuestos y Seguimiento en Tiempo Real</Text>
        </View>

        {currentTrip && currentTrip.status === 'active' && (
          <Card style={styles.activeTrip}>
            <Text style={styles.activeTripTitle}>🚀 Viaje Activo</Text>
            <Text style={styles.activeTripText}>
              Tienes un viaje en curso. Continúa para ver el progreso.
            </Text>
            <Button
              title="Continuar Viaje"
              onPress={handleContinueTrip}
              style={styles.continueButton}
            />
          </Card>
        )}

        <Card>
          <Text style={styles.cardTitle}>⚙️ Configuración de Tarifas</Text>
          <Text style={styles.cardDescription}>
            Configura tus precios base para calcular presupuestos
          </Text>

          <Input
            label="Precio Base"
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="decimal-pad"
            prefix="$"
            placeholder="50.00"
          />

          <Input
            label="Precio por Kilómetro"
            value={pricePerKm}
            onChangeText={setPricePerKm}
            keyboardType="decimal-pad"
            prefix="$"
            suffix="/ km"
            placeholder="10.00"
          />

          <Input
            label="Precio por Minuto de Espera"
            value={pricePerMinute}
            onChangeText={setPricePerMinute}
            keyboardType="decimal-pad"
            prefix="$"
            suffix="/ min"
            placeholder="5.00"
          />

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>Ejemplo (10 km, 20 min):</Text>
            <Text style={styles.examplePrice}>{formatCurrency(estimatedTotal())}</Text>
          </View>

          <Button title="Guardar Configuración" onPress={handleSaveConfig} />
        </Card>

        <Button
          title="🗺️ Nuevo Viaje"
          onPress={handleNewTrip}
          variant="outline"
          style={styles.newTripButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Configura tus tarifas y comienza a crear presupuestos para tus viajes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  activeTrip: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  activeTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  activeTripText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  exampleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  exampleLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  examplePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  newTripButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
