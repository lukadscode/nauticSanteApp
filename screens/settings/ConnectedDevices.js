import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { GOOGLE_FIT_CLIENT_ID } from "../../services/env";
import moment from "moment";

let AppleHealthKit = null;
let GoogleFit = null;
let Scopes = null;

try {
  // Essayer différents imports pour react-native-health
  const healthModule = require("react-native-health");
  const { NativeModules } = require("react-native");

  // D'abord essayer le module importé directement
  let healthKitModule =
    healthModule.default || healthModule.AppleHealthKit || healthModule;

  // Si le module n'expose que Constants, essayer d'accéder aux NativeModules
  if (Platform.OS === "ios") {
    // Essayer différents noms de modules natifs possibles
    const possibleNativeModules = [
      NativeModules.RNCHealth,
      NativeModules.AppleHealthKit,
      NativeModules.ReactNativeHealth,
      NativeModules.Health,
    ];

    for (const nativeModule of possibleNativeModules) {
      if (nativeModule && nativeModule.initHealthKit) {
        console.log(
          "Found native HealthKit module:",
          Object.keys(nativeModule)
        );
        healthKitModule = nativeModule;
        break;
      }
    }

    // Si on n'a toujours que Constants, vérifier si le module natif existe
    if (
      !healthKitModule.initHealthKit &&
      Object.keys(healthKitModule).length === 1 &&
      healthKitModule.Constants
    ) {
      console.log("Only Constants available, checking NativeModules...");
      console.log(
        "Available NativeModules:",
        Object.keys(NativeModules).filter(
          (key) =>
            key.toLowerCase().includes("health") ||
            key.toLowerCase().includes("rnc")
        )
      );
    }
  }

  AppleHealthKit = healthKitModule;

  // Exposer Constants depuis le module importé si disponible
  if (healthModule.Constants || healthModule.default?.Constants) {
    AppleHealthKit.Constants =
      healthModule.Constants || healthModule.default.Constants;
  }

  console.log("Apple Health module loaded successfully", {
    hasAppleHealthKit: !!AppleHealthKit,
    moduleKeys: Object.keys(healthModule),
    appleHealthKitKeys: AppleHealthKit ? Object.keys(AppleHealthKit) : [],
    platform: Platform.OS,
    hasInitHealthKit: typeof AppleHealthKit?.initHealthKit,
    hasIsAvailable: typeof AppleHealthKit?.isAvailable,
    hasAuthorize: typeof AppleHealthKit?.authorize,
    hasConstants: !!AppleHealthKit?.Constants,
  });
} catch (e) {
  console.error("Apple Health not available:", e);
  AppleHealthKit = null;
}

try {
  const GoogleFitModule = require("react-native-google-fit");
  GoogleFit = GoogleFitModule.default || GoogleFitModule;
  Scopes = GoogleFitModule.Scopes;
  console.log("Google Fit module loaded successfully", {
    hasGoogleFit: !!GoogleFit,
    hasScopes: !!Scopes,
    moduleKeys: Object.keys(GoogleFitModule),
    googleFitKeys: GoogleFit ? Object.keys(GoogleFit) : [],
  });
} catch (e) {
  console.error("Google Fit not available:", e);
  GoogleFit = null;
  Scopes = null;
}

const DEVICES = [
  {
    id: "garmin",
    name: "Garmin",
    icon: "watch-outline",
    color: "#007CC3",
    description: "Synchronisez vos activités Garmin",
  },
  {
    id: "strava",
    name: "Strava",
    icon: "bicycle-outline",
    color: "#FC4C02",
    description: "Importez vos courses et sorties",
  },
  {
    id: "apple_health",
    name: "Apple Health",
    icon: "heart-outline",
    color: "#FF2D55",
    description:
      "Synchronisation automatique de tous vos entraînements (iPhone)",
  },
  {
    id: "google_fit",
    name: "Google Fit",
    icon: "fitness-outline",
    color: "#4285F4",
    description:
      "Synchronisation automatique de tous vos entraînements (Android)",
  },
];

const ConnectedDevices = ({ navigation }) => {
  const appContext = useContext(AuthContext);
  const [connectedDevices, setConnectedDevices] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    if (appContext.user) loadConnectedDevices();
  }, [appContext.user]);

  const loadConnectedDevices = async () => {
    try {
      setLoading(true);
      const externalConnections = appContext.user.externalConnections || {};
      setConnectedDevices({
        garmin: !!externalConnections.garmin?.accessToken,
        strava: !!externalConnections.strava?.accessToken,
        apple_health: !!externalConnections.apple_health?.connected,
        google_fit: !!externalConnections.google_fit?.connected,
      });
    } catch (error) {
      console.error("Erreur chargement appareils:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const me = await API.get("/users/me");
      appContext.setUser(me.data);
      await loadConnectedDevices();
    } catch (err) {
      console.error("Erreur rafraîchissement :", err);
      Alert.alert("Erreur", "Impossible d'actualiser les connexions.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleDevice = async (deviceId) => {
    const isConnected = connectedDevices[deviceId];
    if (isConnected) handleDisconnect(deviceId);
    else handleConnect(deviceId);
  };

  const handleConnect = async (deviceId) => {
    setToggling((prev) => ({ ...prev, [deviceId]: true }));
    try {
      if (deviceId === "apple_health") {
        await connectAppleHealth();
      } else if (deviceId === "google_fit") {
        await connectGoogleFit();
      } else {
        const response = await API.get(
          `/third-party-auth/authorize/${deviceId}`
        );
        if (response.data.authUrl) {
          navigation.navigate("WebViewAuth", {
            url: response.data.authUrl,
            deviceId,
            onSuccess: async () => {
              const me = await API.get("/users/me");
              appContext.setUser(me.data);
              await loadConnectedDevices();
            },
          });
        }
      }
    } catch (error) {
      console.error(`Erreur connexion ${deviceId}:`, error);
      Alert.alert("Erreur", "Impossible de se connecter à cet appareil.");
    } finally {
      setToggling((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  const handleDisconnect = async (deviceId) => {
    if (deviceId === "apple_health" || deviceId === "google_fit") {
      const device = DEVICES.find((d) => d.id === deviceId);
      Alert.alert(
        `Déconnecter ${device.name}`,
        `Êtes-vous sûr de vouloir déconnecter ${device.name} ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Déconnecter",
            style: "destructive",
            onPress: async () => {
              setToggling((prev) => ({ ...prev, [deviceId]: true }));
              try {
                // Déconnecter du service si nécessaire
                if (deviceId === "google_fit" && GoogleFit) {
                  try {
                    await GoogleFit.disconnect();
                    console.log("Google Fit déconnecté");
                  } catch (disconnectError) {
                    console.error(
                      "Erreur déconnexion Google Fit:",
                      disconnectError
                    );
                  }
                }

                // Supprimer de la liste des connexions
                const user = appContext.user;
                const externalConnections = user.externalConnections || {};
                delete externalConnections[deviceId];

                // Sauvegarder sur le serveur
                const modifiedUser = { ...user, externalConnections };
                try {
                  const res = (await API.put("/user/me", modifiedUser))?.data;
                  appContext.setUser(res || modifiedUser);
                } catch (apiError) {
                  console.error("Erreur sauvegarde déconnexion:", apiError);
                  // Mettre à jour localement quand même
                  appContext.setUser(modifiedUser);
                }

                setConnectedDevices((prev) => ({ ...prev, [deviceId]: false }));
                Alert.alert(
                  "Déconnecté",
                  `${device.name} a été déconnecté avec succès.`
                );
              } catch (error) {
                console.error(`Erreur déconnexion ${deviceId}:`, error);
                Alert.alert("Erreur", "Impossible de se déconnecter.");
              } finally {
                setToggling((prev) => ({ ...prev, [deviceId]: false }));
              }
            },
          },
        ]
      );
      return;
    }

    const device = DEVICES.find((d) => d.id === deviceId);
    Alert.alert(
      `Déconnecter ${device.name}`,
      `Êtes-vous sûr de vouloir déconnecter ${device.name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            setToggling((prev) => ({ ...prev, [deviceId]: true }));
            try {
              const user = appContext.user;
              const externalConnections = user.externalConnections || {};
              delete externalConnections[deviceId];
              const modifiedUser = { ...user, externalConnections };
              try {
                const res = (await API.put("/user/me", modifiedUser))?.data;
                appContext.setUser(res || modifiedUser);
              } catch (apiError) {
                console.error("Erreur sauvegarde déconnexion:", apiError);
                appContext.setUser(modifiedUser);
              }
              setConnectedDevices((prev) => ({ ...prev, [deviceId]: false }));
            } catch (error) {
              console.error(`Erreur déconnexion ${deviceId}:`, error);
              Alert.alert("Erreur", "Impossible de se déconnecter.");
            } finally {
              setToggling((prev) => ({ ...prev, [deviceId]: false }));
            }
          },
        },
      ]
    );
  };

  const connectAppleHealth = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Disponible uniquement sur iPhone");
      return;
    }

    if (!AppleHealthKit) {
      // Vérifier si c'est un simulateur (HealthKit ne fonctionne pas sur simulateur)
      const isSimulator =
        Platform.OS === "ios" &&
        Platform.isPad === false &&
        Platform.isTV === false;
      let message =
        "Apple Health nécessite un build natif avec les modules natifs compilés.\n\n";

      if (isSimulator) {
        message +=
          "⚠️ Vous êtes sur un simulateur iOS. Apple Health ne fonctionne PAS sur les simulateurs.\n\n";
        message += "Pour utiliser Apple Health :\n";
        message += "1. Testez sur un iPhone physique\n";
        message +=
          "2. Créez un build natif avec : eas build --profile development --platform ios\n";
        message += "3. Installez le build sur votre iPhone physique\n";
        message += "4. Réessayez de connecter Apple Health";
      } else {
        message +=
          "Vous utilisez probablement Expo Go, qui ne supporte pas les modules natifs.\n\n";
        message += "Pour utiliser Apple Health :\n";
        message +=
          "1. Créez un build natif avec : eas build --profile development --platform ios\n";
        message += "2. Installez le build sur votre iPhone\n";
        message += "3. Réessayez de connecter Apple Health";
      }

      Alert.alert("Module non disponible", message);
      return;
    }

    // Vérifier les méthodes disponibles
    console.log("AppleHealthKit methods:", {
      hasInitHealthKit: typeof AppleHealthKit.initHealthKit,
      hasIsAvailable: typeof AppleHealthKit.isAvailable,
      hasAuthorize: typeof AppleHealthKit.authorize,
      allKeys: Object.keys(AppleHealthKit),
    });

    // Vérifier si le module natif est correctement lié
    if (
      !AppleHealthKit.initHealthKit &&
      (!AppleHealthKit.Constants || Object.keys(AppleHealthKit).length <= 1)
    ) {
      console.error("AppleHealthKit module not properly linked", {
        availableMethods: Object.keys(AppleHealthKit),
        platform: Platform.OS,
      });

      const isSimulator =
        Platform.OS === "ios" &&
        Platform.isPad === false &&
        Platform.isTV === false;
      let message =
        "Le module Apple Health n'est pas correctement lié au build natif.\n\n";

      if (isSimulator) {
        message +=
          "⚠️ Vous êtes sur un simulateur iOS. Apple Health ne fonctionne PAS sur les simulateurs.\n\n";
        message += "Pour utiliser Apple Health :\n";
        message += "1. Testez sur un iPhone physique\n";
        message += "2. Créez un nouveau build natif avec :\n";
        message += "   eas build --profile development --platform ios\n";
        message += "3. Installez le build sur votre iPhone physique\n";
        message += "4. Réessayez de connecter Apple Health";
      } else {
        message +=
          "Le module natif n'est pas correctement lié. Vous devez refaire un build natif.\n\n";
        message += "Pour corriger le problème :\n";
        message += "1. Créez un nouveau build natif avec :\n";
        message += "   eas build --profile development --platform ios\n";
        message += "2. Installez le nouveau build sur votre iPhone\n";
        message += "3. Réessayez de connecter Apple Health\n\n";
        message +=
          "Le module react-native-health doit être lié lors de la compilation native.";
      }

      Alert.alert("Module non lié", message);
      return;
    }

    // Vérifier si HealthKit est disponible
    if (AppleHealthKit.isAvailable) {
      AppleHealthKit.isAvailable((err, available) => {
        if (err || !available) {
          Alert.alert(
            "Apple Health non disponible",
            "HealthKit n'est pas disponible sur cet appareil."
          );
          return;
        }
        // Continuer avec l'initialisation
        initializeHealthKit();
      });
    } else {
      // Si isAvailable n'existe pas, essayer directement initHealthKit
      initializeHealthKit();
    }

    function initializeHealthKit() {
      // Vérifier si Constants existe
      if (!AppleHealthKit.Constants || !AppleHealthKit.Constants.Permissions) {
        console.error("AppleHealthKit.Constants.Permissions not available");
        Alert.alert(
          "Erreur de configuration",
          "Le module Apple Health n'est pas correctement configuré. Vérifiez que le build natif a été créé avec les permissions HealthKit."
        );
        return;
      }

      const PERMS = AppleHealthKit.Constants.Permissions;
      const options = {
        permissions: {
          read: [
            PERMS.Steps,
            PERMS.DistanceWalkingRunning,
            PERMS.ActiveEnergyBurned,
            PERMS.DistanceCycling,
            PERMS.DistanceSwimming,
            PERMS.Workout,
          ],
          write: [],
        },
      };

      // Vérifier si initHealthKit existe
      if (!AppleHealthKit.initHealthKit) {
        console.error("AppleHealthKit.initHealthKit is not a function", {
          availableMethods: Object.keys(AppleHealthKit),
        });

        Alert.alert(
          "Erreur de module",
          "La méthode initHealthKit n'est pas disponible. Le module react-native-health n'est pas correctement lié au build natif.\n\n" +
            "Vous devez refaire un build natif avec :\n" +
            "eas build --profile development --platform ios"
        );
        return;
      }

      // initHealthKit() demande automatiquement les permissions si nécessaire
      // iOS affichera automatiquement le dialogue de permissions natif
      console.log(
        "Initialisation de HealthKit - les permissions seront demandées automatiquement..."
      );

      // Afficher un message informatif à l'utilisateur
      Alert.alert(
        "Autorisation requise",
        "iOS va vous demander d'autoriser l'accès à Apple Health. Veuillez accepter toutes les permissions pour que la synchronisation fonctionne correctement.",
        [{ text: "OK" }]
      );

      AppleHealthKit.initHealthKit(options, async (err) => {
        if (err) {
          console.error("Erreur init Apple Health:", err);
          let errorMessage = "Impossible d'accéder à Apple Health.";

          // Messages d'erreur plus spécifiques
          if (
            err.message?.includes("permission") ||
            err.message?.includes("denied") ||
            err.code === 3 // Code d'erreur pour permissions refusées
          ) {
            errorMessage =
              "L'accès à Apple Health a été refusé. Veuillez autoriser l'accès dans Réglages > Confidentialité > Santé > Nautic'Santé.\n\n" +
              "Activez toutes les catégories nécessaires : Pas, Distance, Calories, Entraînements.";
          } else if (
            err.message?.includes("not available") ||
            err.message?.includes("not supported")
          ) {
            errorMessage =
              "Apple Health n'est pas disponible sur cet appareil. Veuillez utiliser un iPhone avec iOS 8.0 ou supérieur.";
          } else if (err.code === 2) {
            errorMessage =
              "Les permissions Apple Health ne sont pas configurées correctement. Veuillez réinstaller l'application.";
          }

          Alert.alert("Erreur de connexion", errorMessage);
          return;
        }

        try {
          await syncAppleHealthData();

          // Sauvegarder dans le profil utilisateur AVANT de mettre à jour l'état UI
          const user = appContext.user;
          const externalConnections = user.externalConnections || {};
          externalConnections.apple_health = { connected: true };

          // Utiliser /user/me comme dans les autres fichiers
          const modifiedUser = {
            ...user,
            externalConnections: externalConnections,
          };

          try {
            const res = (await API.put("/user/me", modifiedUser))?.data;
            if (res) {
              await appContext.setUser(res);
              // Mettre à jour l'état après sauvegarde réussie
              setConnectedDevices((prev) => ({ ...prev, apple_health: true }));
            } else {
              await appContext.setUser({ ...user, externalConnections });
              setConnectedDevices((prev) => ({ ...prev, apple_health: true }));
            }
          } catch (apiError) {
            console.error("Erreur sauvegarde profil Apple Health:", apiError);
            // Mettre à jour localement quand même pour que le switch reste activé
            await appContext.setUser({ ...user, externalConnections });
            setConnectedDevices((prev) => ({ ...prev, apple_health: true }));
          }

          Alert.alert(
            "Apple Health connecté ✅",
            "Vos entraînements des 7 derniers jours ont été synchronisés."
          );
        } catch (apiErr) {
          console.error("Erreur synchronisation Apple Health:", apiErr);
          Alert.alert(
            "Erreur de synchronisation",
            `Impossible de synchroniser les données.\n\n${
              apiErr.message || "Erreur inconnue"
            }`
          );
        }
      });
    } // Fin de initializeHealthKit
  };

  const syncAppleHealthData = async () => {
    const startDate = moment().subtract(7, "days").startOf("day").toDate();
    const endDate = moment().endOf("day").toDate();

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    return new Promise((resolve, reject) => {
      AppleHealthKit.getSamples(options, async (err, workouts) => {
        if (err) {
          console.error("Erreur récupération workouts:", err);
        }

        AppleHealthKit.getDailyStepCountSamples(
          options,
          async (err, stepsData) => {
            if (err) {
              reject(err);
              return;
            }

            const groupedByDate = {};

            if (stepsData && stepsData.length > 0) {
              stepsData.forEach((item) => {
                const date = moment(item.startDate).format("YYYY-MM-DD");
                if (!groupedByDate[date]) {
                  groupedByDate[date] = { steps: 0, distance: 0, calories: 0 };
                }
                groupedByDate[date].steps += item.value;
              });
            }

            AppleHealthKit.getDailyDistanceWalkingRunningSamples(
              options,
              (err, distanceData) => {
                if (!err && distanceData && distanceData.length > 0) {
                  distanceData.forEach((item) => {
                    const date = moment(item.startDate).format("YYYY-MM-DD");
                    if (!groupedByDate[date]) {
                      groupedByDate[date] = {
                        steps: 0,
                        distance: 0,
                        calories: 0,
                      };
                    }
                    groupedByDate[date].distance += item.value;
                  });
                }

                AppleHealthKit.getActiveEnergyBurned(
                  options,
                  async (err, caloriesData) => {
                    if (!err && caloriesData && caloriesData.length > 0) {
                      caloriesData.forEach((item) => {
                        const date = moment(item.startDate).format(
                          "YYYY-MM-DD"
                        );
                        if (!groupedByDate[date]) {
                          groupedByDate[date] = {
                            steps: 0,
                            distance: 0,
                            calories: 0,
                          };
                        }
                        groupedByDate[date].calories += item.value;
                      });
                    }

                    for (const [date, data] of Object.entries(groupedByDate)) {
                      if (data.steps >= 6000) {
                        await createWalkingTraining(
                          date,
                          data.steps,
                          data.distance,
                          data.calories
                        );
                      }
                    }

                    resolve();
                  }
                );
              }
            );
          }
        );
      });
    });
  };

  const connectGoogleFit = async () => {
    if (Platform.OS !== "android") {
      Alert.alert("Disponible uniquement sur Android");
      return;
    }

    if (!GoogleFit) {
      Alert.alert(
        "Module non disponible",
        "Google Fit nécessite un build natif avec les modules natifs compilés.\n\n" +
          "Vous utilisez probablement Expo Go, qui ne supporte pas les modules natifs.\n\n" +
          "Pour utiliser Google Fit :\n" +
          "1. Créez un build natif avec : eas build --profile development --platform android\n" +
          "2. Installez le build sur votre appareil Android\n" +
          "3. Réessayez de connecter Google Fit"
      );
      return;
    }

    // Si Scopes n'est pas disponible, on utilise les strings directement
    const FITNESS_SCOPES = Scopes
      ? [
          Scopes.FITNESS_ACTIVITY_READ,
          Scopes.FITNESS_LOCATION_READ,
          Scopes.FITNESS_BODY_READ,
        ]
      : [
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.location.read",
          "https://www.googleapis.com/auth/fitness.body.read",
        ];

    try {
      console.log("Tentative de connexion à Google Fit...");

      // react-native-google-fit a une méthode authorize() explicite
      const options = {
        scopes: FITNESS_SCOPES,
      };

      const authResult = await GoogleFit.authorize(options);
      console.log("Google Fit authorization result:", authResult);

      if (!authResult.success) {
        let errorMessage =
          "Vous devez autoriser l'accès à Google Fit pour synchroniser vos données.";

        // Messages d'erreur plus spécifiques
        if (
          authResult.message?.includes("OAuth") ||
          authResult.message?.includes("configuration") ||
          authResult.message?.includes("SIGN_IN_REQUIRED")
        ) {
          errorMessage =
            "La configuration OAuth Google Fit n'est pas correcte. Vérifiez que le SHA-1 fingerprint est configuré dans Google Cloud Console et que le package name correspond à : com.undersolutions.nauticsante";
        } else if (
          authResult.message?.includes("permission") ||
          authResult.message?.includes("denied") ||
          authResult.message?.includes("cancel")
        ) {
          errorMessage =
            "L'accès à Google Fit a été refusé ou annulé. Veuillez autoriser l'accès et réessayer.";
        }

        Alert.alert("Connexion refusée", errorMessage);
        return;
      }

      // Si on arrive ici, l'authentification a réussi
      // Demander la permission ACTIVITY_RECOGNITION avant de synchroniser
      if (Platform.OS === "android") {
        try {
          // ACTIVITY_RECOGNITION est disponible depuis Android 10 (API 29)
          // Utiliser le string directement pour être sûr
          const permission = "android.permission.ACTIVITY_RECOGNITION";

          const granted = await PermissionsAndroid.request(permission, {
            title: "Permission de reconnaissance d'activité",
            message:
              "Nautic'Santé a besoin de la permission de reconnaissance d'activité pour accéder à vos données Google Fit.",
            buttonNeutral: "Demander plus tard",
            buttonNegative: "Refuser",
            buttonPositive: "Autoriser",
          });

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              "Permission refusée",
              "La permission de reconnaissance d'activité est nécessaire pour synchroniser vos données Google Fit. Veuillez l'autoriser dans les paramètres de l'application."
            );
            return;
          }
        } catch (err) {
          console.error("Erreur demande permission:", err);
          // Continuer quand même - parfois la permission peut être déjà accordée
          console.log(
            "Permission non accordée, mais on continue quand même..."
          );
        }
      }

      // Synchroniser les données des 7 derniers jours
      await syncGoogleFitData();

      // Sauvegarder dans le profil utilisateur AVANT de mettre à jour l'état UI
      const user = appContext.user;
      const externalConnections = user.externalConnections || {};
      externalConnections.google_fit = { connected: true };

      // Utiliser /user/me comme dans les autres fichiers et n'envoyer que les champs nécessaires
      const modifiedUser = {
        ...user,
        externalConnections: externalConnections,
      };

      try {
        const res = (await API.put("/user/me", modifiedUser))?.data;
        if (res) {
          await appContext.setUser(res);
          // Mettre à jour l'état après sauvegarde réussie
          setConnectedDevices((prev) => ({ ...prev, google_fit: true }));
        } else {
          // Fallback si la réponse n'a pas de data
          await appContext.setUser({ ...user, externalConnections });
          setConnectedDevices((prev) => ({ ...prev, google_fit: true }));
        }
      } catch (apiError) {
        console.error("Erreur sauvegarde profil:", apiError);
        // Mettre à jour localement quand même pour que le switch reste activé
        await appContext.setUser({ ...user, externalConnections });
        setConnectedDevices((prev) => ({ ...prev, google_fit: true }));
        // Ne pas bloquer - la connexion fonctionne même si la sauvegarde échoue
      }

      Alert.alert(
        "Google Fit connecté ✅",
        "Vos entraînements des 7 derniers jours ont été synchronisés."
      );
    } catch (err) {
      console.error("Erreur Google Fit détaillée:", err);
      let errorMessage = "Impossible de se connecter à Google Fit.";

      // Messages d'erreur plus spécifiques selon le type d'erreur
      if (
        err.message?.includes("OAuth") ||
        err.message?.includes("configuration") ||
        err.message?.includes("sign_in") ||
        err.message?.includes("SIGN_IN_REQUIRED")
      ) {
        errorMessage =
          "La configuration OAuth Google Fit n'est pas correcte. Vérifiez que le SHA-1 fingerprint est configuré dans Google Cloud Console et que le package name correspond à : com.undersolutions.nauticsante";
      } else if (
        err.message?.includes("network") ||
        err.message?.includes("connection")
      ) {
        errorMessage =
          "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
      } else if (
        err.message?.includes("permission") ||
        err.message?.includes("denied") ||
        err.message?.includes("cancel") ||
        err.message?.includes("USER_CANCELED")
      ) {
        errorMessage =
          "L'accès à Google Fit a été refusé ou annulé. Veuillez autoriser l'accès et réessayer.";
      } else {
        errorMessage = `Impossible de se connecter à Google Fit.\n\n${
          err.message || "Erreur inconnue"
        }`;
      }

      Alert.alert("Erreur de connexion", errorMessage);
    }
  };

  const syncGoogleFitData = async () => {
    // react-native-google-fit utilise des objets Date
    const startDate = moment().subtract(7, "days").startOf("day").toDate();
    const endDate = moment().endOf("day").toDate();

    console.log("Google Fit sync dates:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    try {
      // react-native-google-fit utilise getDailyStepCountSamples pour les pas
      const stepsData = await GoogleFit.getDailyStepCountSamples({
        startDate: startDate,
        endDate: endDate,
      });

      // getDailyDistanceSamples pour la distance
      const distanceData = await GoogleFit.getDailyDistanceSamples({
        startDate: startDate,
        endDate: endDate,
      });

      // getDailyCalorieSamples pour les calories
      const caloriesData = await GoogleFit.getDailyCalorieSamples({
        startDate: startDate,
        endDate: endDate,
      });

      const groupedByDate = {};

      // react-native-google-fit retourne des données au format spécifique
      // Adapter le traitement selon le format de données retourné
      if (stepsData && stepsData.length > 0) {
        stepsData.forEach((day) => {
          // Format : { startDate: timestamp, endDate: timestamp, value: number }
          const date = moment(day.startDate || day.date).format("YYYY-MM-DD");
          const daySteps = day.value || day.quantity || 0;
          if (!groupedByDate[date]) {
            groupedByDate[date] = { steps: 0, distance: 0, calories: 0 };
          }
          groupedByDate[date].steps += daySteps || 0;
        });
      }

      if (distanceData && distanceData.length > 0) {
        distanceData.forEach((item) => {
          const date = moment(item.startDate || item.date).format("YYYY-MM-DD");
          if (!groupedByDate[date]) {
            groupedByDate[date] = { steps: 0, distance: 0, calories: 0 };
          }
          // Distance en mètres - convertir en km si nécessaire
          const distance = item.value || item.quantity || 0;
          groupedByDate[date].distance += distance || 0;
        });
      }

      if (caloriesData && caloriesData.length > 0) {
        caloriesData.forEach((item) => {
          const date = moment(item.startDate || item.date).format("YYYY-MM-DD");
          if (!groupedByDate[date]) {
            groupedByDate[date] = { steps: 0, distance: 0, calories: 0 };
          }
          groupedByDate[date].calories += item.value || item.quantity || 0;
        });
      }

      for (const [date, data] of Object.entries(groupedByDate)) {
        if (data.steps >= 6000) {
          await createWalkingTraining(
            date,
            data.steps,
            data.distance,
            data.calories
          );
        }
      }
    } catch (error) {
      console.error("Google Fit data fetch error:", error);
      throw error;
    }
  };

  const createWalkingTraining = async (date, steps, distance, calories) => {
    try {
      const multiplier = Math.floor(steps / 6000);
      const durationMinutes = 30 * multiplier;

      const trainingData = {
        date: date,
        realDuration: durationMinutes * 60,
        distance: distance / 1000,
        mood: 1,
        state: "finished",
      };

      await API.post("/calendar-element/createMyActivityElement", trainingData);
      console.log(
        `Entraînement créé pour ${date}: ${durationMinutes} min, ${steps} pas`
      );
    } catch (error) {
      console.error("Erreur création entraînement:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Montres connectées</Text>

        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          {refreshing ? (
            <ActivityIndicator size="small" color="#1E283C" />
          ) : (
            <Ionicons name="refresh" size={22} color="#1E283C" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2167b1" />
          </View>
        ) : (
          <View style={styles.devicesContainer}>
            {DEVICES.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceIconContainer}>
                  <View
                    style={[
                      styles.deviceIconCircle,
                      { backgroundColor: device.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={device.icon}
                      size={28}
                      color={device.color}
                    />
                  </View>
                </View>

                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceDescription}>
                    {device.description}
                  </Text>
                  {connectedDevices[device.id] && (
                    <View style={styles.connectedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#4CAF50"
                      />
                      <Text style={styles.connectedText}>Connecté</Text>
                    </View>
                  )}
                </View>

                <View style={styles.deviceAction}>
                  {toggling[device.id] ? (
                    <ActivityIndicator size="small" color="#2167b1" />
                  ) : (
                    <Switch
                      value={connectedDevices[device.id] || false}
                      onValueChange={() => handleToggleDevice(device.id)}
                      trackColor={{ false: "#E0E0E0", true: "#2167b1" }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f6f9ff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E283C" },
  refreshButton: { padding: 5 },
  contentContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  loadingContainer: { paddingVertical: 40, alignItems: "center" },
  devicesContainer: { gap: 15 },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceIconContainer: { marginRight: 15 },
  deviceIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: { flex: 1 },
  deviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 4,
  },
  deviceDescription: { fontSize: 13, color: "#8D95A7", lineHeight: 18 },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  connectedText: { fontSize: 12, color: "#4CAF50", fontWeight: "600" },
  deviceAction: { marginLeft: 10 },
});

export default ConnectedDevices;
