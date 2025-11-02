# 🔥 Configuración de Firebase para Tracking en Tiempo Real

Esta guía te ayudará a configurar Firebase para habilitar el tracking en tiempo real de viajes en Motoquero.

## 📋 ¿Por qué Firebase?

Firebase Realtime Database permite:
- ✅ Sincronización en tiempo real de ubicación
- ✅ Escalabilidad automática
- ✅ Sin necesidad de servidor propio
- ✅ Configuración rápida y gratuita (plan Spark)

## 🚀 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Nombre del proyecto: `motoquero-app` (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

## 📱 Paso 2: Registrar Apps

### Para Android:
1. En la consola de Firebase, haz clic en el ícono de Android
2. **Nombre del paquete**: `com.motoquero.app` (debe coincidir con `app.json`)
3. **Apodo de la app**: Motoquero Android
4. Descarga `google-services.json`
5. Coloca el archivo en: `motoquero-app/android/app/google-services.json`

### Para iOS:
1. Haz clic en el ícono de iOS
2. **ID del paquete**: `com.motoquero.app` (debe coincidir con `app.json`)
3. **Apodo de la app**: Motoquero iOS
4. Descarga `GoogleService-Info.plist`
5. Coloca el archivo en: `motoquero-app/ios/GoogleService-Info.plist`

### Para Web (Tracking View):
1. Haz clic en el ícono de Web
2. **Apodo de la app**: Motoquero Web
3. Copia la configuración (la usaremos después)

## 🔧 Paso 3: Configurar Realtime Database

1. En el menú lateral, ve a **Realtime Database**
2. Haz clic en "Crear base de datos"
3. Selecciona ubicación (elige la más cercana a tus usuarios)
4. **Modo de seguridad**: Comienza en modo de prueba (cambiaremos las reglas después)
5. Haz clic en "Habilitar"

### Configurar Reglas de Seguridad

Ve a la pestaña "Reglas" y reemplaza con:

```json
{
  "rules": {
    "trips": {
      "$tripToken": {
        ".read": true,
        ".write": "!data.exists() || data.child('status').val() !== 'completed'",
        ".validate": "newData.hasChildren(['origin', 'destination', 'status', 'totalPrice'])",
        "origin": {
          ".validate": "newData.hasChildren(['latitude', 'longitude'])"
        },
        "destination": {
          ".validate": "newData.hasChildren(['latitude', 'longitude'])"
        },
        "currentLocation": {
          ".validate": "newData.hasChildren(['latitude', 'longitude'])"
        },
        "status": {
          ".validate": "newData.isString() && (newData.val() === 'pending' || newData.val() === 'active' || newData.val() === 'completed')"
        }
      }
    }
  }
}
```

**Explicación de las reglas:**
- Cualquiera puede **leer** un viaje (para el tracking público)
- Solo se puede **escribir** si el viaje no existe o no está completado
- Se validan los campos requeridos
- Los viajes completados no se pueden modificar

## 📦 Paso 4: Instalar Firebase SDK

```bash
cd motoquero-app
npm install firebase
```

## 🔑 Paso 5: Configurar Firebase en la App

Crea el archivo `src/services/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
import { Trip } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "motoquero-app.firebaseapp.com",
  databaseURL: "https://motoquero-app-default-rtdb.firebaseio.com",
  projectId: "motoquero-app",
  storageBucket: "motoquero-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const FirebaseService = {
  async saveTrip(trip: Trip): Promise<void> {
    if (!trip.shareToken) return;
    
    const tripRef = ref(database, `trips/${trip.shareToken}`);
    await set(tripRef, {
      origin: trip.origin,
      destination: trip.destination,
      currentLocation: trip.currentLocation || trip.origin,
      distance: trip.distance,
      estimatedTime: trip.estimatedTime,
      totalPrice: trip.totalPrice,
      status: trip.status,
      createdAt: trip.createdAt,
      startedAt: trip.startedAt,
    });
  },

  async updateLocation(token: string, location: { latitude: number; longitude: number }): Promise<void> {
    const locationRef = ref(database, `trips/${token}/currentLocation`);
    await set(locationRef, location);
  },

  subscribeToTrip(token: string, callback: (trip: any) => void): () => void {
    const tripRef = ref(database, `trips/${token}`);
    
    onValue(tripRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });

    return () => off(tripRef);
  },
};
```

**⚠️ IMPORTANTE**: Reemplaza `firebaseConfig` con tus propios valores de Firebase Console.

## 🔄 Paso 6: Integrar Firebase en TripContext

Actualiza `src/contexts/TripContext.tsx`:

```typescript
import { FirebaseService } from '../services/firebase';

// En startTrip:
const startTrip = async (tripId: string) => {
  // ... código existente ...
  
  // Guardar en Firebase
  await FirebaseService.saveTrip(updatedTrip);
  
  // Actualizar ubicación en Firebase cada vez que cambie
  const subscription = await LocationService.watchPosition(async (location) => {
    setCurrentTrip((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, currentLocation: location };
      StorageService.saveCurrentTrip(updated);
      
      // Actualizar en Firebase
      if (prev.shareToken) {
        FirebaseService.updateLocation(prev.shareToken, location);
      }
      
      return updated;
    });
  });
};
```

## 🌐 Paso 7: Crear Web View para Tracking

Crea un sitio web simple para que los clientes vean el tracking:

### Estructura del proyecto web:
```
tracking-web/
├── index.html
├── style.css
└── app.js
```

### index.html:
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rastreo de Viaje - Motoquero</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY"></script>
</head>
<body>
  <div id="app">
    <header>
      <h1>🏍️ Motoquero</h1>
      <p>Rastreando tu viaje en tiempo real</p>
    </header>
    
    <div id="map"></div>
    
    <div id="info">
      <div class="info-card">
        <h3>Estado del Viaje</h3>
        <p id="status">Cargando...</p>
      </div>
      <div class="info-card">
        <h3>Precio Total</h3>
        <p id="price">$0.00</p>
      </div>
    </div>
  </div>

  <script type="module" src="app.js"></script>
</body>
</html>
```

### app.js:
```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
  // Tu configuración aquí
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Obtener token de la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token') || window.location.pathname.split('/').pop();

let map, originMarker, destinationMarker, currentMarker, routeLine;

function initMap(origin, destination) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: origin,
    zoom: 13,
    styles: [/* Estilo oscuro del mapa */]
  });

  originMarker = new google.maps.Marker({
    position: origin,
    map: map,
    title: 'Origen',
    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
  });

  destinationMarker = new google.maps.Marker({
    position: destination,
    map: map,
    title: 'Destino',
    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
  });

  currentMarker = new google.maps.Marker({
    position: origin,
    map: map,
    title: 'Motoquero',
    icon: '🏍️'
  });

  routeLine = new google.maps.Polyline({
    path: [origin, destination],
    geodesic: true,
    strokeColor: '#FF8C00',
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map: map
  });
}

function updateTrip(data) {
  if (!map) {
    initMap(
      { lat: data.origin.latitude, lng: data.origin.longitude },
      { lat: data.destination.latitude, lng: data.destination.longitude }
    );
  }

  if (data.currentLocation) {
    const pos = { lat: data.currentLocation.latitude, lng: data.currentLocation.longitude };
    currentMarker.setPosition(pos);
    map.panTo(pos);
  }

  document.getElementById('status').textContent = 
    data.status === 'active' ? '🚀 En Curso' : 
    data.status === 'completed' ? '✅ Completado' : '⏳ Pendiente';
  
  document.getElementById('price').textContent = `$${data.totalPrice.toFixed(2)}`;
}

// Suscribirse a cambios
const tripRef = ref(database, `trips/${token}`);
onValue(tripRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    updateTrip(data);
  } else {
    document.getElementById('status').textContent = 'Viaje no encontrado';
  }
});
```

### Desplegar en Firebase Hosting:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar hosting
firebase init hosting

# Desplegar
firebase deploy --only hosting
```

Tu URL será: `https://motoquero-app.web.app/track/[TOKEN]`

## 🔒 Paso 8: Seguridad Adicional

### Expiración Automática de Viajes

Agrega una Cloud Function para limpiar viajes antiguos:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.cleanupOldTrips = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.database();
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 horas

    const snapshot = await db.ref('trips').once('value');
    const updates = {};

    snapshot.forEach((child) => {
      const trip = child.val();
      if (trip.createdAt < cutoff) {
        updates[child.key] = null;
      }
    });

    return db.ref('trips').update(updates);
  });
```

## 📊 Paso 9: Monitoreo

En Firebase Console:
1. Ve a **Realtime Database** > **Uso**
2. Monitorea:
   - Conexiones simultáneas
   - Ancho de banda
   - Almacenamiento

## 💰 Costos

### Plan Spark (Gratuito):
- 1 GB almacenamiento
- 10 GB/mes descarga
- 100 conexiones simultáneas

### Plan Blaze (Pago por uso):
- $5/GB almacenamiento adicional
- $1/GB descarga adicional
- Conexiones ilimitadas

## ✅ Verificación

Prueba que todo funcione:

1. Crea un viaje en la app
2. Inicia el viaje
3. Comparte el enlace
4. Abre el enlace en un navegador
5. Verifica que la ubicación se actualice en tiempo real

## 🐛 Solución de Problemas

### Error: "Permission denied"
- Verifica las reglas de seguridad en Firebase Console
- Asegúrate de que el token sea válido

### La ubicación no se actualiza
- Verifica que `FirebaseService.updateLocation()` se esté llamando
- Revisa los logs de Firebase en la consola
- Verifica la conexión a internet

### Error: "Firebase not initialized"
- Verifica que `firebaseConfig` sea correcto
- Asegúrate de que Firebase esté inicializado antes de usarlo

## 📚 Recursos

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Firebase Security Rules](https://firebase.google.com/docs/database/security)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

**¡Firebase configurado! 🔥**
