import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomInput from "../../themes/Input";
import CustomButton from "../../themes/ButtonBlue";
import API from "../../services/api";
import { AntDesign } from "@expo/vector-icons"; // pour l'icône ←

const { height: screenHeight } = Dimensions.get("screen");

const ResetPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Champ requis", "Veuillez entrer votre adresse email.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/forgot-password", {
        identifier: email,
      });

      if (response.status === 200) {
        Alert.alert(
          "Email envoyé",
          "Un lien de réinitialisation de mot de passe a été envoyé à votre adresse email."
        );
        navigation.navigate("Login");
      } else {
        throw new Error("Une erreur s’est produite.");
      }
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        "Impossible d’envoyer l’email de réinitialisation.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -200}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={["#2167b1", "#5A9EE2"]}
          style={styles.container}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logos/logo_ns_v_b.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.content}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Bouton retour */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <AntDesign name="arrowleft" size={24} color="#1d1d1b" />
                <Text style={styles.backButtonText}>Retour</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Réinitialiser le mot de passe</Text>

              <CustomInput
                label="Adresse mail *"
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />

              {loading ? (
                <ActivityIndicator size="large" color="#2167b1" />
              ) : (
                <CustomButton
                  title="Envoyer le lien de réinitialisation"
                  onPress={handleResetPassword}
                />
              )}

              <Text style={styles.backLink} onPress={() => navigation.goBack()}>
                Retour à la connexion
              </Text>
            </ScrollView>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: screenHeight * 0.06,
  },
  logo: {
    width: 280,
    height: 100,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: screenHeight * 0.04,
    elevation: 5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 8,
    color: "#1d1d1b",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1d1d1b",
    marginBottom: 30,
    textAlign: "center",
  },
  backLink: {
    textAlign: "center",
    color: "#0056D2",
    fontWeight: "600",
    textDecorationLine: "underline",
    marginTop: 30,
  },
});

export default ResetPassword;
