# 🏍️ Motoquero

**Aplicación móvil de presupuestos y seguimiento en tiempo real para viajes en moto**

## 📱 Características

- ✅ **Sin registro**: Usa la app inmediatamente sin crear cuenta
- 💰 **Presupuestos personalizables**: Configura precio base, por kilómetro y por minuto
- 🗺️ **Mapas integrados**: Selección visual de origen y destino
- 📍 **Tracking en tiempo real**: Comparte tu ubicación con el cliente
- 📤 **Enlaces compartibles**: Genera enlaces únicos para cada viaje
- 📜 **Historial local**: Guarda tus últimos 50 viajes
- 🎨 **Diseño moderno**: Tema oscuro con acentos en naranja brillante

## 🚀 Tecnologías

- **React Native** con **Expo** (TypeScript)
- **React Navigation** para navegación
- **React Native Maps** para mapas
- **Expo Location** para geolocalización
- **AsyncStorage** para persistencia local
- **Firebase** (opcional) para tracking en tiempo real

## 📦 Instalación

```bash
# Instalar dependencias
cd motoquero-app
npm install

# Iniciar en desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS (requiere macOS)
npm run ios

# Ejecutar en web
npm run web
```

## ⚙️ Configuración

### Google Maps API Key

Para usar mapas en Android, necesitas configurar una API Key de Google Maps:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto y habilita "Maps SDK for Android"
3. Genera una API Key
4. Edita `app.json` y reemplaza `YOUR_GOOGLE_MAPS_API_KEY` con tu clave

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "TU_API_KEY_AQUI"
    }
  }
}
```

### Permisos de Ubicación

La app solicita automáticamente permisos de ubicación. Los mensajes están configurados en `app.json`:

- **iOS**: `NSLocationWhenInUseUsageDescription`
- **Android**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

## 🎯 Uso

### 1. Configurar Tarifas
- Abre la app y ve a la pantalla de inicio
- Configura tu precio base, precio por kilómetro y precio por minuto
- Guarda la configuración

### 2. Crear Viaje
- Toca "Nuevo Viaje" o ve a la pestaña "Mapa"
- Selecciona el punto de origen (o usa tu ubicación actual)
- Selecciona el punto de destino
- Revisa el presupuesto calculado automáticamente
- Toca "Crear Viaje"

### 3. Iniciar y Compartir
- En la pantalla del viaje, toca "Iniciar Viaje"
- Toca "Compartir Enlace" para enviar el tracking al cliente
- El cliente podrá ver tu ubicación en tiempo real

### 4. Completar Viaje
- Cuando llegues al destino, toca "Completar Viaje"
- El viaje se guardará en tu historial local

## 📂 Estructura del Proyecto

```
motoquero-app/
├── src/
│   ├── components/       # Componentes reutilizables (Button, Input, Card)
│   ├── contexts/         # Context API (TripContext)
│   ├── screens/          # Pantallas principales
│   │   ├── HomeScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── TripScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── services/         # Servicios (storage, location, sharing)
│   ├── types/            # TypeScript types
│   └── utils/            # Utilidades (constants, calculations)
├── App.tsx               # Punto de entrada con navegación
├── app.json              # Configuración de Expo
└── package.json          # Dependencias
```

## 🎨 Diseño

### Colores
- **Primario**: Negro `#000000`
- **Acento**: Naranja brillante `#FF8C00`
- **Texto**: Blanco `#FFFFFF`
- **Secundario**: Gris `#CCCCCC`

### Tipografía
- **Fuente**: Montserrat (Google Fonts)
- **Pesos**: Regular (400), Semi-Bold (600), Bold (700)

## 🔒 Seguridad y Privacidad

- ✅ Sin registro ni almacenamiento de datos personales
- ✅ Historial guardado solo localmente en el dispositivo
- ✅ Enlaces de tracking con tokens únicos (UUID)
- ✅ Permisos de ubicación solicitados explícitamente
- ⚠️ Los enlaces compartidos son públicos (cualquiera con el enlace puede ver el tracking)

## 🚧 Próximas Funcionalidades

- [ ] Integración completa con Firebase Realtime Database
- [ ] Notificaciones push para motoquero y cliente
- [ ] Modo offline con caché de mapas
- [ ] Múltiples monedas e idiomas
- [ ] Exportación de historial a PDF/CSV
- [ ] Estadísticas de viajes (distancia total, ingresos, etc.)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades, abre un issue en el repositorio.

---

**Desarrollado con ❤️ para motoqueros**
