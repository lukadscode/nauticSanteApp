import React, { useState } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const WebViewAuth = ({ route, navigation }) => {
  const { url, deviceId, onSuccess } = route.params;
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState) => {
    const { url: currentUrl } = navState;

    if (currentUrl.includes("/auth/callback") || currentUrl.includes("/success")) {
      if (onSuccess) {
        onSuccess();
      }
      Alert.alert(
        "Connexion réussie",
        "Votre appareil a été connecté avec succès.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }

    if (currentUrl.includes("/error") || currentUrl.includes("/cancel")) {
      Alert.alert(
        "Connexion annulée",
        "La connexion à l'appareil a été annulée.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2167b1" />
        </View>
      )}
      <WebView
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        style={styles.webview}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    zIndex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewAuth;
