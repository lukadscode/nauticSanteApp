import React, {useContext, useState} from "react";
import {Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import {AuthContext} from "../../context/AuthContext";
import API from "../../services/api";

const NotificationSettings = ({navigation}) => {
  const appContext = useContext(AuthContext);

  const [trainingNotifications, setTrainingNotifications] = useState(appContext.user.trainingNotifications);
  const [newsNotifications, setNewsNotifications] = useState(appContext.user.newsNotifications);

  const handleSave = async () => {
    const modifiedUser = appContext.user
    modifiedUser.trainingNotifications = trainingNotifications
    modifiedUser.newsNotifications = newsNotifications


    const res = (await API.put('/user/me', modifiedUser))?.data
    await appContext.setUser(res)
    Alert.alert("Succès", "Vos préférences ont été mises à jour avec succès !");
    navigation.goBack();
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C"/>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Paramètres de Notification</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications d'entraînement</Text>
          <Switch
            value={trainingNotifications}
            onValueChange={(value) => setTrainingNotifications(value)}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications News</Text>
          <Switch
            value={newsNotifications}
            onValueChange={(value) => setNewsNotifications(value)}
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
  container: {
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: "#1E283C",
    marginLeft: 10,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
  },
  settingLabel: {
    fontSize: 16,
    color: "#1E283C",
  },
  saveButton: {
    backgroundColor: "#0056D2",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotificationSettings;
