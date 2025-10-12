import React, { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { Image } from "expo-image";
import { EXPO_PUBLIC_ASSETS_URL } from "../services/env";
import API from "../services/api";

const Profile = ({ navigation }) => {
  const appContext = useContext(AuthContext);
  const [user, setUser] = useState(appContext.user);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setUser(appContext.user);
  }, [appContext]);

  const handleLogout = async () => {
    await appContext.logout();
    navigation.navigate("Onboarding");
  };

  const handleBlockAccount = async () => {
    const modifiedUser = appContext.user;
    modifiedUser.blocked = true;
    await API.put("/user/me", modifiedUser);
    await appContext.logout();
    navigation.navigate("Onboarding");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                EXPO_PUBLIC_ASSETS_URL +
                (user?.avatar?.formats?.medium?.url ??
                  "/uploads/default_profile_dde55edc6c.png"),
            }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        <View style={styles.mainSettings}>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.settingText}>Modifier mon profil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate("MonClub")}
          >
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.settingText}>Mon club</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate("NotificationSettings")}
          >
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            <Text style={styles.settingText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate("ConnectedDevices")}
          >
            <Ionicons name="watch-outline" size={20} color="#FFFFFF" />
            <Text style={styles.settingText}>Montres connectées</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondarySettings}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("TrainingHistory")}
          >
            <Ionicons name="time-outline" size={20} color="#1E283C" />
            <Text style={styles.secondaryText}>Historique des entraînements</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ContactSupport")}
          >
            <Ionicons name="headset-outline" size={20} color="#1E283C" />
            <Text style={styles.secondaryText}>Contacter le Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            <Ionicons name="document-text-outline" size={20} color="#1E283C" />
            <Text style={styles.secondaryText}>
              Politique de confidentialité
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("TermsOfService")}
          >
            <Ionicons name="document-outline" size={20} color="#1E283C" />
            <Text style={styles.secondaryText}>Conditions d'utilisation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#1E283C" />
            <Text style={styles.secondaryText}>Déconnexion</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.deleteButton]}
            onPress={() => setShowConfirmModal(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4C4C" />
            <Text style={[styles.secondaryText, styles.deleteText]}>
              Suppression de mon compte
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Supprimer le compte</Text>
            <Text style={styles.modalText}>
              Es-tu sûr(e) de vouloir supprimer ton compte ? Cette action est
              irréversible.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#FF4C4C" }]}
                onPress={async () => {
                  setShowConfirmModal(false);
                  await handleBlockAccount();
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Supprimer
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E283C",
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 14,
    color: "#8D95A7",
    marginTop: 5,
  },
  mainSettings: {
    backgroundColor: "#2167b1",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  settingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "600",
  },
  secondarySettings: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  secondaryText: {
    color: "#1E283C",
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "600",
  },
  actionSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },
  deleteButton: {
    marginTop: 10,
  },
  deleteText: {
    color: "#FF4C4C",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1E283C",
  },
  modalText: {
    fontSize: 15,
    color: "#1E283C",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#1E283C",
  },
});

export default Profile;
