# Synchronisation Apple Health & Google Fit

## Vue d'ensemble

Le système de synchronisation santé permet aux utilisateurs de :
- Connecter Apple Health (iOS) ou Google Fit (Android)
- Synchroniser automatiquement leurs données de pas, distance et calories
- Convertir les pas en entraînements de marche (6000 pas = 30 minutes)

## Architecture

### Base de données (Supabase)

**Tables créées :**

1. `health_sync_sessions` - Stocke les données de santé synchronisées
   - `user_id` : Référence à l'utilisateur
   - `source` : 'apple_health' ou 'google_fit'
   - `steps` : Nombre de pas
   - `distance` : Distance en mètres
   - `calories` : Calories brûlées
   - `sync_date` : Date de synchronisation
   - `synced_to_training` : Booléen indiquant si converti en entraînement
   - `training_id` : ID de l'entraînement créé

2. `health_sync_settings` - Paramètres de synchronisation par utilisateur
   - `user_id` : Référence à l'utilisateur (unique)
   - `apple_health_enabled` : Active/désactive Apple Health
   - `google_fit_enabled` : Active/désactive Google Fit
   - `auto_sync_enabled` : Synchronisation automatique
   - `steps_threshold` : Seuil de pas (défaut: 6000)
   - `last_sync_date` : Dernière synchronisation

### Services

**healthSync.js** - Service principal de synchronisation
```javascript
import HealthSyncService from './services/healthSync';

// Initialiser
await HealthSyncService.initializeAppleHealth();
await HealthSyncService.initializeGoogleFit();

// Synchroniser les données
const result = await HealthSyncService.syncHealthData(userId, date);

// Convertir en entraînement
const training = await HealthSyncService.convertStepsToTraining(sessionId, userId);
```

**supabase.js** - Client Supabase
```javascript
import { supabase } from './services/supabase';
```

### Écran

**HealthSyncSettings.js** - Interface utilisateur
- Active/désactive la synchronisation
- Synchronisation manuelle
- Historique des synchronisations
- Conversion en entraînements

## Configuration

### Variables d'environnement

Ajouter dans `.env` :
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_API_TOKEN=your_api_token
```

### iOS (Apple Health)

1. **Info.plist** - Ajouter les permissions :
```xml
<key>NSHealthShareUsageDescription</key>
<string>Nous avons besoin d'accéder à vos données de santé pour suivre vos activités</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Nous avons besoin de mettre à jour vos données de santé</string>
```

2. **Capabilities** - Activer HealthKit dans Xcode

3. **app.json** - Ajouter :
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSHealthShareUsageDescription": "Nous avons besoin d'accéder à vos données de santé pour suivre vos activités",
        "NSHealthUpdateUsageDescription": "Nous avons besoin de mettre à jour vos données de santé"
      },
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.access": []
      }
    }
  }
}
```

### Android (Google Fit)

1. **AndroidManifest.xml** - Ajouter les permissions :
```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
```

2. **Google Cloud Console** :
   - Créer un projet
   - Activer l'API Fitness
   - Créer des identifiants OAuth 2.0
   - Ajouter le SHA-1 de votre app

3. **app.json** - Ajouter :
```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACTIVITY_RECOGNITION"
      ]
    }
  }
}
```

## Utilisation

### Accès à l'écran

L'utilisateur peut accéder aux paramètres depuis :
**Profil > Synchronisation Santé**

### Flux utilisateur

1. **Activer la synchronisation**
   - iOS : Active Apple Health
   - Android : Active Google Fit
   - L'app demande les permissions nécessaires

2. **Synchronisation manuelle**
   - Bouton "Synchroniser maintenant"
   - Récupère les données du jour
   - Affiche : pas, distance, calories

3. **Conversion en entraînement**
   - Si >= 6000 pas : Proposition de créer un entraînement
   - Chaque tranche de 6000 pas = 30 minutes de marche
   - Exemples :
     - 6000 pas = 30 min
     - 12000 pas = 60 min (1h)
     - 18000 pas = 90 min (1h30)

4. **Historique**
   - Liste des 10 dernières synchronisations
   - Statut : "Entraînement créé" ou bouton de conversion
   - Détails : pas, distance, calories

## Logique de conversion

```javascript
// Calcul de la durée
const multiplier = Math.floor(steps / 6000);
const durationMinutes = 30 * multiplier;

// Exemple: 8500 pas
// multiplier = Math.floor(8500 / 6000) = 1
// duration = 30 * 1 = 30 minutes
```

## Sécurité (RLS)

Toutes les tables ont Row Level Security activé :
- Les utilisateurs ne peuvent voir que leurs propres données
- Pas d'accès aux données d'autres utilisateurs
- Policies strictes sur toutes les opérations (SELECT, INSERT, UPDATE, DELETE)

## API

### HealthSyncService

**Méthodes principales :**

```javascript
// Initialisation
initializeAppleHealth() -> Promise<boolean>
initializeGoogleFit() -> Promise<boolean>

// Récupération des données
getAppleHealthData(startDate, endDate) -> Promise<{steps, distance, calories}>
getGoogleFitData(startDate, endDate) -> Promise<{steps, distance, calories}>

// Synchronisation
syncHealthData(userId, date) -> Promise<{success, data, updated}>

// Conversion
convertStepsToTraining(sessionId, userId) -> Promise<{success, training, durationMinutes}>

// Paramètres
getSyncSettings(userId) -> Promise<settings>
updateSyncSettings(userId, settings) -> Promise<{success, data}>

// Historique
getRecentSyncSessions(userId, limit) -> Promise<sessions[]>
```

## Dépendances

```json
{
  "react-native-health": "^1.19.0",
  "@ovalmoney/react-native-fitness": "^0.5.3",
  "@supabase/supabase-js": "^2.76.1"
}
```

## Notes importantes

1. **Permissions** : L'utilisateur doit accepter les permissions la première fois
2. **Données uniquement locales** : Les données sont stockées dans Supabase, pas partagées
3. **Conversion manuelle** : La conversion en entraînement nécessite une action utilisateur
4. **Seuil modifiable** : Le seuil de 6000 pas peut être changé dans les settings
5. **Build natif requis** : Ces fonctionnalités nécessitent un build natif (pas Expo Go)

## Déploiement

### iOS

```bash
npx expo prebuild --platform ios
cd ios
pod install
cd ..
npx expo run:ios
```

### Android

```bash
npx expo prebuild --platform android
npx expo run:android
```

## Troubleshooting

**iOS : "Health data not available"**
- Vérifier que HealthKit est activé dans Xcode
- Vérifier les permissions dans Info.plist
- Tester sur un appareil réel (pas simulateur)

**Android : "Authorization failed"**
- Vérifier que l'API Fitness est activée dans Google Cloud
- Vérifier les identifiants OAuth
- Vérifier le SHA-1 de l'application

**Conversion échoue**
- Vérifier que l'API backend est accessible
- Vérifier les variables d'environnement
- Vérifier que l'utilisateur a >= 6000 pas
