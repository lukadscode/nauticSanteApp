import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Cette version neutralise les notifications locales
// car 'expo-notifications' a été retiré du projet.
// Pour les réactiver, réinstalle 'expo-notifications'
// et restaure l'ancienne logique.

const NotificationSystem = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Les notifications sont désactivées dans cette version de l'app.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
});

export default NotificationSystem;
