import React, { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

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
    description: "Accédez à vos données de santé",
  },
  {
    id: "google_fit",
    name: "Google Fit",
    icon: "fitness-outline",
    color: "#4285F4",
    description: "Synchronisez vos données d'activité",
  },
];

const ConnectedDevices = ({ navigation }) => {
  const appContext = useContext(AuthContext);
  const [connectedDevices, setConnectedDevices] = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    loadConnectedDevices();
  }, []);

  const loadConnectedDevices = async () => {
    try {
      setLoading(true);
      const response = await API.get("/user/me");
      const user = response.data;

      setConnectedDevices({
        garmin: user.garminConnected || false,
        strava: user.stravaConnected || false,
        apple_health: user.appleHealthConnected || false,
        google_fit: user.googleFitConnected || false,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des appareils:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDevice = async (deviceId) => {
    const isCurrentlyConnected = connectedDevices[deviceId];

    if (isCurrentlyConnected) {
      handleDisconnect(deviceId);
    } else {
      handleConnect(deviceId);
    }
  };

  const handleConnect = async (deviceId) => {
    setToggling({ ...toggling, [deviceId]: true });

    try {
      const device = DEVICES.find((d) => d.id === deviceId);

      const response = await API.post(`/integrations/${deviceId}/authorize`);

      if (response.data.authUrl) {
        Alert.alert(
          `Connexion à ${device.name}`,
          `Vous allez être redirigé vers ${device.name} pour autoriser l'accès à vos données.`,
          [
            {
              text: "Annuler",
              style: "cancel",
            },
            {
              text: "Continuer",
              onPress: () => {
                navigation.navigate("WebViewAuth", {
                  url: response.data.authUrl,
                  deviceId,
                  onSuccess: () => {
                    setConnectedDevices({
                      ...connectedDevices,
                      [deviceId]: true,
                    });
                  },
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error(`Erreur connexion ${deviceId}:`, error);
      Alert.alert(
        "Erreur",
        "Impossible de se connecter à cet appareil pour le moment."
      );
    } finally {
      setToggling({ ...toggling, [deviceId]: false });
    }
  };

  const handleDisconnect = async (deviceId) => {
    const device = DEVICES.find((d) => d.id === deviceId);

    Alert.alert(
      `Déconnecter ${device.name}`,
      `Êtes-vous sûr de vouloir déconnecter ${device.name} ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            setToggling({ ...toggling, [deviceId]: true });
            try {
              await API.delete(`/integrations/${deviceId}/disconnect`);
              setConnectedDevices({
                ...connectedDevices,
                [deviceId]: false,
              });
            } catch (error) {
              console.error(`Erreur déconnexion ${deviceId}:`, error);
              Alert.alert("Erreur", "Impossible de se déconnecter.");
            } finally {
              setToggling({ ...toggling, [deviceId]: false });
            }
          },
        },
      ]
    );
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
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionDescription}>
          Connectez vos appareils pour synchroniser automatiquement vos activités
          sportives et vos données de santé.
        </Text>

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

        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#8D95A7" />
          <Text style={styles.infoText}>
            Vos données sont synchronisées en toute sécurité et vous pouvez les
            déconnecter à tout moment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
  },
  placeholder: {
    width: 34,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#8D95A7",
    lineHeight: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  devicesContainer: {
    gap: 15,
  },
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
  deviceIconContainer: {
    marginRight: 15,
  },
  deviceIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 4,
  },
  deviceDescription: {
    fontSize: 13,
    color: "#8D95A7",
    lineHeight: 18,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  connectedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  deviceAction: {
    marginLeft: 10,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#8D95A7",
    lineHeight: 18,
  },
});

export default ConnectedDevices;
