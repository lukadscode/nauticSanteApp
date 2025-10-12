import React from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { EXPO_PUBLIC_ASSETS_URL } from "../services/env";
import { useNavigation } from "@react-navigation/native";
import OptimizedImage from "../components/OptimizedImage";

const NewsScreen = ({ route }) => {
  const news = route.params?.news;
  const navigation = useNavigation(); // ✅ Ajouté

  const handleClick = () => {
    if (news.actionType === "link") {
      const url =
        Platform.OS === "ios" ? news.destinationIOS : news.destinationAndroid;

      Linking.openURL(url).catch(() =>
        Alert.alert("Erreur", "Impossible d'ouvrir le lien.")
      );
    } else if (news.actionType === "inApp") {
      //Handle InApp redirection
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1E283C" />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          {/* Image */}
          <OptimizedImage
            source={{
              uri: EXPO_PUBLIC_ASSETS_URL + news.image?.formats?.medium?.url,
            }}
            style={styles.image}
            contentFit="cover"
            fallbackIcon="newspaper-outline"
            fallbackIconSize={64}
            priority="high"
          />

          {/* Author */}
          <Text style={styles.author}>
            Publié par : {news.club?.name ?? news.federation}
          </Text>

          {/* Title */}
          <Text style={styles.title}>{news.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{news.description}</Text>

          {/* Styled button */}
          {news.buttonTitle && (
            <TouchableOpacity onPress={handleClick} style={styles.readButton}>
              <LinearGradient
                colors={["#2167b1", "#5A9EE2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.readButtonText}>{news.buttonTitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    paddingHorizontal: 20,
  },
  container: {
    marginVertical: 20,
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
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  author: {
    fontSize: 14,
    color: "#5A5F6F",
    fontStyle: "italic",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E283C",
    marginBottom: 10,
    textAlign: "left",
  },
  description: {
    fontSize: 16,
    color: "#4B5565",
    lineHeight: 22,
    marginBottom: 30,
    textAlign: "left",
  },
  readButton: {
    alignSelf: "center",
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  readButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default NewsScreen;
