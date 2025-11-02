import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TripProvider } from './src/contexts/TripContext';
import { HomeScreen, MapScreen, TripScreen, HistoryScreen } from './src/screens';
import { COLORS } from './src/utils/constants';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <TripProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: COLORS.cardBackground,
              borderTopColor: COLORS.border,
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: COLORS.accent,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Inicio',
              tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
            }}
          />
          <Tab.Screen
            name="Map"
            component={MapScreen}
            options={{
              tabBarLabel: 'Mapa',
              tabBarIcon: ({ color }) => <TabIcon icon="🗺️" color={color} />,
            }}
          />
          <Tab.Screen
            name="Trip"
            component={TripScreen}
            options={{
              tabBarLabel: 'Viaje',
              tabBarIcon: ({ color }) => <TabIcon icon="🏍️" color={color} />,
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarLabel: 'Historial',
              tabBarIcon: ({ color }) => <TabIcon icon="📜" color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </TripProvider>
  );
}

const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => {
  return (
    <span style={{ fontSize: 24, filter: color === COLORS.accent ? 'brightness(1.2)' : 'none' }}>
      {icon}
    </span>
  );
};
