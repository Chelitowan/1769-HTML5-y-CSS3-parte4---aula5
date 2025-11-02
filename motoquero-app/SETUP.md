# 🚀 Guía de Configuración - Motoquero

Esta guía te ayudará a configurar y ejecutar la aplicación Motoquero en tu entorno de desarrollo.

## 📋 Requisitos Previos

### Para Desarrollo General
- **Node.js** 18+ y npm
- **Expo CLI** (se instala automáticamente con el proyecto)
- **Expo Go** app en tu dispositivo móvil (para testing rápido)

### Para Android
- **Android Studio** con Android SDK
- **Emulador Android** o dispositivo físico con USB debugging
- **Google Maps API Key** (ver sección de configuración)

### Para iOS (solo macOS)
- **Xcode** 14+
- **CocoaPods**
- **Simulador iOS** o dispositivo físico

## 🔧 Instalación Paso a Paso

### 1. Clonar e Instalar Dependencias

```bash
cd motoquero-app
npm install
```

### 2. Configurar Google Maps API Key

#### Obtener la API Key:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps SDK for Android
   - Maps SDK for iOS (si vas a compilar para iOS)
   - Directions API (para cálculo de rutas)
4. Ve a "Credenciales" y crea una API Key
5. Restringe la API Key a tus aplicaciones (opcional pero recomendado)

#### Configurar en la App:
Edita `app.json` y reemplaza `YOUR_GOOGLE_MAPS_API_KEY`:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "AIzaSy..."
    }
  }
}
```

### 3. Configurar Variables de Entorno (Opcional)

Copia `.env.example` a `.env` y configura tus valores:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
TRACKING_BASE_URL=https://tu-dominio.com/track
```

## 🏃 Ejecutar la Aplicación

### Modo Desarrollo con Expo Go

La forma más rápida de probar la app:

```bash
npm start
```

Esto abrirá Expo DevTools. Luego:
1. Escanea el QR con la app **Expo Go** (iOS/Android)
2. La app se cargará en tu dispositivo

### Android

#### Con Emulador:
```bash
npm run android
```

#### Con Dispositivo Físico:
1. Habilita "Depuración USB" en tu dispositivo
2. Conecta el dispositivo por USB
3. Ejecuta: `npm run android`

### iOS (solo macOS)

#### Con Simulador:
```bash
npm run ios
```

#### Con Dispositivo Físico:
1. Abre el proyecto en Xcode
2. Selecciona tu dispositivo
3. Compila y ejecuta desde Xcode

### Web (para testing rápido)

```bash
npm run web
```

**Nota**: Los mapas y geolocalización tienen funcionalidad limitada en web.

## 🗺️ Configuración de Mapas

### Android
- La API Key se configura en `app.json`
- Los permisos de ubicación se solicitan automáticamente

### iOS
- Apple Maps se usa por defecto (no requiere API Key)
- Los permisos se configuran en `app.json` bajo `ios.infoPlist`

## 🔐 Permisos

La app solicita los siguientes permisos:

### Android
- `ACCESS_FINE_LOCATION`: Ubicación precisa
- `ACCESS_COARSE_LOCATION`: Ubicación aproximada
- `FOREGROUND_SERVICE`: Para tracking en primer plano

### iOS
- `NSLocationWhenInUseUsageDescription`: Ubicación mientras se usa la app
- `NSLocationAlwaysAndWhenInUseUsageDescription`: Ubicación en segundo plano

## 🐛 Solución de Problemas

### Error: "Google Maps API Key not found"
- Verifica que hayas configurado la API Key en `app.json`
- Asegúrate de que la API Key tenga habilitado "Maps SDK for Android"
- Reconstruye la app: `expo prebuild --clean`

### Error: "Location permissions denied"
- Ve a Configuración > Apps > Motoquero > Permisos
- Habilita "Ubicación"

### La app no se conecta al servidor de desarrollo
- Asegúrate de que tu dispositivo y computadora estén en la misma red WiFi
- Desactiva firewalls o VPNs temporalmente
- Usa el modo túnel: `expo start --tunnel`

### Mapas no se muestran en Android
- Verifica la API Key
- Asegúrate de que el dispositivo tenga Google Play Services
- Revisa los logs: `npx react-native log-android`

### Error de compilación en iOS
- Ejecuta: `cd ios && pod install && cd ..`
- Limpia el build: `rm -rf ios/build`
- Abre Xcode y limpia el proyecto (Cmd+Shift+K)

## 📱 Testing en Dispositivos Reales

### Recomendaciones:
1. **Siempre prueba en dispositivos reales** para funcionalidades de ubicación
2. **Prueba en exteriores** para mejor precisión de GPS
3. **Prueba con diferentes velocidades** de movimiento
4. **Verifica el consumo de batería** durante tracking prolongado

## 🔄 Actualizar Dependencias

```bash
# Actualizar todas las dependencias
npm update

# Actualizar Expo SDK
npx expo upgrade

# Verificar dependencias obsoletas
npm outdated
```

## 📦 Compilar para Producción

### Android APK/AAB

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar EAS
eas build:configure

# Compilar APK (para testing)
eas build --platform android --profile preview

# Compilar AAB (para Google Play)
eas build --platform android --profile production
```

### iOS IPA

```bash
# Compilar para TestFlight/App Store
eas build --platform ios --profile production
```

## 🌐 Desplegar Web View para Tracking

Para que los enlaces de tracking funcionen, necesitas desplegar una web view:

1. Crea un sitio web simple que lea el token de la URL
2. Conecta con Firebase Realtime Database
3. Muestra el mapa con la ubicación en tiempo real
4. Actualiza `TRACKING_BASE_URL` en `.env`

Ejemplo de estructura:
```
https://tu-dominio.com/track/[TOKEN]
```

## 📚 Recursos Adicionales

- [Documentación de Expo](https://docs.expo.dev/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Maps Platform](https://developers.google.com/maps)

## 💡 Consejos de Desarrollo

1. **Usa Expo Go** para desarrollo rápido
2. **Compila development builds** para testing de funcionalidades nativas
3. **Usa React DevTools** para debugging
4. **Habilita Fast Refresh** para ver cambios instantáneamente
5. **Revisa los logs** regularmente: `npx react-native log-android` o `log-ios`

## 🤝 Soporte

Si encuentras problemas:
1. Revisa esta guía completa
2. Consulta los logs de error
3. Busca en [Expo Forums](https://forums.expo.dev/)
4. Abre un issue en el repositorio

---

**¡Listo para desarrollar! 🚀**
