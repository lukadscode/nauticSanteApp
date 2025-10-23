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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
// ✅ Import correct pour ta version (v1.x)
import * as AppleHealthKit from "react-native-health";
import GoogleFit, { Scopes } from "react-native-google-fit";

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
    description: "Accédez à vos données de santé (iPhone)",
  },
  {
    id: "google_fit",
    name: "Google Fit",
    icon: "fitness-outline",
    color: "#4285F4",
    description: "Synchronisez vos données d'activité (Android)",
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
<<<<<<< HEAD
      console.error(`Erreur connexion ${deviceId}:`, error);
      Alert.alert("Erreur", "Impossible de se connecter à cet appareil.");
=======
      console.error(`Erreur connexion ${deviceId}:`, error.response.data);
      Alert.alert(
        "Erreur",
        "Impossible de se connecter à cet appareil pour le moment."
      );
>>>>>>> a8b100478ee3aeede533ef2146eb7c3e3f772438
    } finally {
      setToggling((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  const handleDisconnect = async (deviceId) => {
    if (deviceId === "apple_health" || deviceId === "google_fit") {
      setConnectedDevices((prev) => ({ ...prev, [deviceId]: false }));
      Alert.alert(`${deviceId} déconnecté`);
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
              await API.put("/users/me", user);
              appContext.setUser(user);
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

  // 🍎 Apple Health — version 1.x correcte
  const connectAppleHealth = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Disponible uniquement sur iPhone");
      return;
    }

    const PERMS = AppleHealthKit.Constants.Permissions;
    const options = {
      permissions: {
        read: [PERMS.StepCount, PERMS.HeartRate, PERMS.Workout],
        write: [],
      },
    };

    AppleHealthKit.initHealthKit(options, (err) => {
      if (err) {
        console.error("Erreur init Apple Health:", err);
        Alert.alert("Erreur", "Impossible d’accéder à Apple Health.");
        return;
      }

      const today = new Date().toISOString();
      AppleHealthKit.getStepCount({ date: today }, async (error, result) => {
        if (error) {
          Alert.alert("Erreur lecture HealthKit", error.message);
          return;
        }

        try {
          await API.post("/user/health-data", { steps: result.value });
          setConnectedDevices((prev) => ({ ...prev, apple_health: true }));
          Alert.alert(
            "Apple Health connecté ✅",
            `Pas du jour : ${result.value}`
          );
        } catch (apiErr) {
          console.error(apiErr);
          Alert.alert("Erreur", "Impossible d’enregistrer les données.");
        }
      });
    });
  };

  const connectGoogleFit = async () => {
    if (Platform.OS !== "android") {
      Alert.alert("Disponible uniquement sur Android");
      return;
    }

    const options = {
      scopes: [Scopes.FITNESS_ACTIVITY_READ, Scopes.FITNESS_BODY_READ],
    };

    GoogleFit.authorize(options)
      .then(async (res) => {
        if (!res.success) {
          Alert.alert("Erreur", "Connexion Google Fit refusée.");
          return;
        }

        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const data = await GoogleFit.getDailyStepCountSamples({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });

        const todaySteps = data?.[0]?.steps?.[0]?.value || 0;
        await API.post("/user/health-data", { steps: todaySteps });

        setConnectedDevices((prev) => ({ ...prev, google_fit: true }));
        Alert.alert("Google Fit connecté ✅", `Pas du jour : ${todaySteps}`);
      })
      .catch((err) => {
        console.error("Erreur Google Fit:", err);
        Alert.alert("Erreur", "Impossible de se connecter à Google Fit.");
      });
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
