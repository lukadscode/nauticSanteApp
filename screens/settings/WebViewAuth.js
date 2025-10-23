import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const WebViewAuth = ({ route, navigation }) => {
  const { url, deviceId, onSuccess } = route.params;
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);
  const webViewRef = useRef(null);

  const defaultUserAgent =
    "Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36";

  // ✅ Si c’est Garmin → ouvrir dans le navigateur et sortir de la WebView
  useEffect(() => {
    if (url.includes("connect.garmin.com")) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir Garmin dans le navigateur.");
      });
      navigation.goBack();
    }
  }, [url]);

  const injectedJS = `
    (function() {
      window.open = function(url) {
        window.location.href = url;
        return window;
      };
      const _log = console.log;
      console.log = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE', args: Array.from(arguments) }));
        _log.apply(console, arguments);
      };
    })();
    true;
  `;

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message?.type === "CONSOLE") {
        console.log("WebView console:", ...message.args);
        return;
      }

      switch (message.type) {
        case "OAUTH_SUCCESS":
          if (onSuccess) onSuccess();
          navigation.goBack();
          break;
        case "OAUTH_ERROR":
          Alert.alert(
            "Erreur de connexion",
            `La connexion a échoué: ${message.error || "Erreur inconnue"}`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
          break;
        case "CLOSE_WEBVIEW":
          navigation.goBack();
          break;
        default:
          console.log("Message WebView reçu:", message);
      }
    } catch (err) {
      console.log("Erreur parsing message WebView:", err);
    }
  };

  const handleNavigationStateChange = (navState) => {
    const { url: newUrl } = navState;
    setCurrentUrl(newUrl);

    if (newUrl.includes("/api/third-party-auth/callback")) return;

    if (newUrl.startsWith("nauticsante://")) {
      if (newUrl.includes("/auth/success")) {
        if (onSuccess) onSuccess();
        navigation.goBack();
      } else if (newUrl.includes("/auth/error")) {
        const params = new URLSearchParams(newUrl.split("?")[1] || "");
        const err = params.get("error");
        Alert.alert(
          "Erreur de connexion",
          `La connexion a échoué: ${err || "Erreur inconnue"}`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
      return;
    }

    if (newUrl.includes("/error") || newUrl.includes("/cancel")) {
      Alert.alert("Connexion annulée", "La connexion a été annulée.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleShouldStartLoadWithRequest = useCallback(
    (request) => {
      if (!request || !request.url) return true;
      const requestUrl = request.url;

      if (requestUrl.startsWith("intent://")) {
        let httpsUrl = requestUrl.replace(/^intent:\/\//, "https://");
        httpsUrl = httpsUrl.split("#Intent;")[0];
        console.log("Rewrite intent:// =>", httpsUrl);
        setCurrentUrl(httpsUrl);
        return false;
      }

      if (
        requestUrl.startsWith("garminconnect://") ||
        requestUrl.startsWith("com.garmin.connect://") ||
        requestUrl.startsWith("market://") ||
        requestUrl.startsWith("app://")
      ) {
        console.log("Blocked external scheme:", requestUrl);
        return false;
      }

      return true;
    },
    [setCurrentUrl]
  );

  // 🧠 Si Garmin => on retourne null (car ouvert dans navigateur)
  if (url.includes("connect.garmin.com")) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2167b1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2167b1" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{
          uri: currentUrl,
          headers: { "Accept-Charset": "utf-8" },
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          if (webViewRef.current) setLoading(false);
        }}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        injectedJavaScript={injectedJS}
        userAgent={defaultUserAgent}
        originWhitelist={["*"]}
        setSupportMultipleWindows={false}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        cacheEnabled={false}
        incognito
        style={styles.webview}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  webview: { flex: 1 },
});

export default WebViewAuth;
