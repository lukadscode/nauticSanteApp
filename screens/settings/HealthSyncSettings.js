import React, { useEffect, useState, useContext } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import HealthSyncService from "../../services/healthSync";
import { AuthContext } from "../../context/AuthContext";

const HealthSyncSettings = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [settings, setSettings] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    loadSettings();
    loadRecentSessions();
  }, []);

  const loadSettings = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await HealthSyncService.getSyncSettings(user.id);
      setSettings(data);
    } catch (error) {
      console.error("Load settings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSessions = async () => {
    if (!user?.id) return;
    try {
      const sessions = await HealthSyncService.getRecentSyncSessions(user.id, 10);
      setRecentSessions(sessions);
    } catch (error) {
      console.error("Load sessions error:", error);
    }
  };

  const handleToggleAutoSync = async (value) => {
    if (!user?.id) return;
    const result = await HealthSyncService.updateSyncSettings(user.id, {
      auto_sync_enabled: value,
    });
    if (result.success) {
      setSettings(result.data);
    }
  };

  const handleTogglePlatformSync = async (platform, value) => {
    if (!user?.id) return;

    if (value) {
      const initialized =
        platform === "apple"
          ? await HealthSyncService.initializeAppleHealth()
          : await HealthSyncService.initializeGoogleFit();

      if (!initialized) {
        Alert.alert(
          "Erreur",
          "Impossible d'accéder aux données de santé. Veuillez vérifier les permissions dans les paramètres."
        );
        return;
      }
    }

    const field =
      platform === "apple" ? "apple_health_enabled" : "google_fit_enabled";
    const result = await HealthSyncService.updateSyncSettings(user.id, {
      [field]: value,
    });

    if (result.success) {
      setSettings(result.data);
    }
  };

  const handleManualSync = async () => {
    if (!user?.id) return;

    setSyncing(true);
    try {
      const result = await HealthSyncService.syncHealthData(user.id);

      if (result.success) {
        Alert.alert(
          "Synchronisation réussie",
          `Pas: ${result.data.steps}\nDistance: ${(result.data.distance / 1000).toFixed(2)} km\nCalories: ${Math.round(result.data.calories)}`
        );
        await loadRecentSessions();

        if (result.data.steps >= 6000) {
          Alert.alert(
            "Créer un entraînement",
            `Vous avez ${result.data.steps} pas. Voulez-vous créer un entraînement de marche ?`,
            [
              { text: "Non", style: "cancel" },
              {
                text: "Oui",
                onPress: () => handleConvertToTraining(result.data.id),
              },
            ]
          );
        }
      } else {
        Alert.alert("Erreur", result.error || "Échec de la synchronisation");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite");
    } finally {
      setSyncing(false);
    }
  };

  const handleConvertToTraining = async (sessionId) => {
    if (!user?.id) return;

    try {
      const result = await HealthSyncService.convertStepsToTraining(
        sessionId,
        user.id
      );

      if (result.success) {
        Alert.alert(
          "Entraînement créé",
          `Durée: ${result.durationMinutes} minutes`
        );
        await loadRecentSessions();
      } else {
        Alert.alert("Erreur", result.error);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer l'entraînement");
    }
  };

  const renderSessionItem = (session) => {
    const date = moment(session.sync_date);
    const canConvert = session.steps >= 6000 && !session.synced_to_training;

    return (
      <View key={session.id} style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionDateContainer}>
            <Ionicons
              name={
                session.source === "apple_health"
                  ? "fitness"
                  : "logo-google"
              }
              size={20}
              color="#2167b1"
            />
            <Text style={styles.sessionDate}>{date.format("DD/MM/YYYY")}</Text>
          </View>
          {session.synced_to_training && (
            <View style={styles.syncedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.syncedText}>Entraînement créé</Text>
            </View>
          )}
        </View>

        <View style={styles.sessionStats}>
          <View style={styles.statItem}>
            <Ionicons name="footsteps" size={18} color="#8D95A7" />
            <Text style={styles.statValue}>{session.steps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>pas</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="navigate" size={18} color="#8D95A7" />
            <Text style={styles.statValue}>
              {(session.distance / 1000).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>km</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="flame" size={18} color="#8D95A7" />
            <Text style={styles.statValue}>{Math.round(session.calories)}</Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>
        </View>

        {canConvert && (
          <TouchableOpacity
            style={styles.convertButton}
            onPress={() => handleConvertToTraining(session.id)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#2167b1" />
            <Text style={styles.convertButtonText}>
              Créer un entraînement ({Math.floor(session.steps / 6000) * 30} min)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2167b1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Synchronisation Santé</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>

          {Platform.OS === "ios" && (
            <View style={styles.settingCard}>
              <View style={styles.settingContent}>
                <Ionicons name="fitness" size={24} color="#2167b1" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Apple Health</Text>
                  <Text style={styles.settingDescription}>
                    Synchroniser avec Apple Santé
                  </Text>
                </View>
              </View>
              <Switch
                value={settings?.apple_health_enabled || false}
                onValueChange={(value) => handleTogglePlatformSync("apple", value)}
                trackColor={{ false: "#E0E6F0", true: "#2167b1" }}
                thumbColor="#fff"
              />
            </View>
          )}

          {Platform.OS === "android" && (
            <View style={styles.settingCard}>
              <View style={styles.settingContent}>
                <Ionicons name="logo-google" size={24} color="#2167b1" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Google Fit</Text>
                  <Text style={styles.settingDescription}>
                    Synchroniser avec Google Fit
                  </Text>
                </View>
              </View>
              <Switch
                value={settings?.google_fit_enabled || false}
                onValueChange={(value) =>
                  handleTogglePlatformSync("google", value)
                }
                trackColor={{ false: "#E0E6F0", true: "#2167b1" }}
                thumbColor="#fff"
              />
            </View>
          )}

          <View style={styles.settingCard}>
            <View style={styles.settingContent}>
              <Ionicons name="sync" size={24} color="#2167b1" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Synchronisation auto</Text>
                <Text style={styles.settingDescription}>
                  Synchroniser automatiquement chaque jour
                </Text>
              </View>
            </View>
            <Switch
              value={settings?.auto_sync_enabled || false}
              onValueChange={handleToggleAutoSync}
              trackColor={{ false: "#E0E6F0", true: "#2167b1" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#2167b1" />
            <Text style={styles.infoText}>
              Chaque tranche de 6 000 pas = 30 minutes de marche à intensité faible
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Synchronisation manuelle</Text>
          </View>

          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
            onPress={handleManualSync}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.syncButtonText}>Synchronisation...</Text>
              </>
            ) : (
              <>
                <Ionicons name="refresh" size={22} color="#fff" />
                <Text style={styles.syncButtonText}>Synchroniser maintenant</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {recentSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique récent</Text>
            {recentSessions.map(renderSessionItem)}
          </View>
        )}
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
    borderBottomColor: "#E0E6F0",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 12,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#8D95A7",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#2167b1",
    fontWeight: "500",
  },
  syncButton: {
    flexDirection: "row",
    backgroundColor: "#2167b1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2167b1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  syncButtonDisabled: {
    backgroundColor: "#B0B9C8",
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  sessionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E283C",
  },
  syncedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  syncedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  sessionStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
  },
  statLabel: {
    fontSize: 12,
    color: "#8D95A7",
  },
  convertButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    gap: 6,
  },
  convertButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2167b1",
  },
});

export default HealthSyncSettings;
