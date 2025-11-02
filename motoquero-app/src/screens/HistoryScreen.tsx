import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../components';
import { useTrip } from '../contexts/TripContext';
import { Trip } from '../types';
import { COLORS } from '../utils/constants';
import { formatCurrency, formatDistance, formatTime } from '../utils/calculations';

export const HistoryScreen: React.FC = () => {
  const { tripHistory, loadHistory } = useTrip();

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTripItem = ({ item }: { item: Trip }) => (
    <Card style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{formatDate(item.createdAt)}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Origen</Text>
            <Text style={styles.detailValue}>
              {item.origin.address || `${item.origin.latitude.toFixed(4)}, ${item.origin.longitude.toFixed(4)}`}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🎯</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Destino</Text>
            <Text style={styles.detailValue}>
              {item.destination.address || `${item.destination.latitude.toFixed(4)}, ${item.destination.longitude.toFixed(4)}`}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distancia</Text>
            <Text style={styles.statValue}>{formatDistance(item.distance)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tiempo</Text>
            <Text style={styles.statValue}>{formatTime(item.estimatedTime)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValuePrice}>{formatCurrency(item.totalPrice)}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'active':
        return 'En Curso';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: COLORS.textSecondary };
      case 'active':
        return { backgroundColor: COLORS.accent };
      case 'completed':
        return { backgroundColor: COLORS.success };
      default:
        return { backgroundColor: COLORS.border };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>📜 Historial de Viajes</Text>
        <Text style={styles.subtitle}>
          {tripHistory.length} {tripHistory.length === 1 ? 'viaje' : 'viajes'} registrados
        </Text>
      </View>

      {tripHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏍️</Text>
          <Text style={styles.emptyTitle}>Sin viajes aún</Text>
          <Text style={styles.emptyText}>
            Tus viajes completados aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={tripHistory}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  tripCard: {
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  tripDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  statValuePrice: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
