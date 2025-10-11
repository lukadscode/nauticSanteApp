import React, { useContext, useRef, useState } from "react";
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
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomButton from "../../themes/ButtonBlue";
import CustomInput from "../../themes/Input";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNetInfo } from "@react-native-community/netinfo";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const Login = ({ navigation }) => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false); // État pour le loader
  const netInfo = useNetInfo();

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const appContext = useContext(AuthContext);

  const handleLogin = async () => {
    if (!licenseNumber || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    setLoading(true);

    try {
      // Vérification de la connexion réseau
      if (!netInfo.isConnected) {
        setLoading(false);
        Alert.alert("Problème réseau", "Vérifiez votre connexion Internet.");
        return;
      }

      // Envoi de la requête d'authentification
      const response = await API.post("/auth/local", {
        identifier: licenseNumber,
        password,
      });

      const { jwt, refreshToken, user } = response.data;

      if (!jwt || !refreshToken || !user) {
        throw new Error("Données de connexion manquantes.");
      }

      await appContext.login(user, jwt, refreshToken);
      navigation.navigate("Main");
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error) {
        const error = e.response.data.error;

        if (
          error.status === 400 &&
          error.message === "Your account email is not confirmed"
        ) {
          Alert.alert(
            "Compte non confirmé",
            "Vous devez confirmer votre compte via le lien reçu par email."
          );
        } else if (
          error.status === 400 &&
          error.message === "Invalid identifier or password"
        ) {
          Alert.alert(
            "Erreur de connexion",
            "Votre email et mot de passe ne correspondent à aucun compte."
          );
        } else if (
          error.status === 400 &&
          error.message === "Your account has been blocked by an administrator"
        ) {
          Alert.alert(
            "Erreur de connexion",
            "Votre compte a été bloqué, s'il s'agit d'une erreur veuillez contacter un administrateur."
          );
        } else {
          Alert.alert(
            "Erreur API",
            `Statut: ${error.status}\nMessage: ${error.message}`
          );
        }
      } else {
        Alert.alert("Erreur inconnue", `Détails: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ResetPassword");
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
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: keyboardVisible ? 40 : 0,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>
                Connecte toi{" "}
                <Text style={styles.subtitle}>pour t’entraîner</Text>
              </Text>

              <View style={styles.inputContainer}>
                <CustomInput
                  label="Adresse mail *"
                  placeholder="123456"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current.focus()}
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  label="Mot de passe *"
                  placeholder="********"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  ref={passwordRef}
                  onSubmitEditing={handleLogin}
                />
              </View>

              <Text
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                Mot de passe oublié ?
              </Text>

              {loading ? (
                <ActivityIndicator size="large" color="#2167b1" />
              ) : (
                <CustomButton title="SE CONNECTER" onPress={handleLogin} />
              )}

              <Text style={styles.registerPrompt}>
                Pas encore de compte ?{" "}
                <Text
                  style={styles.registerLink}
                  onPress={() => navigation.navigate("Register")}
                >
                  Créez-en un ici
                </Text>
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1d1d1b",
    marginBottom: 30,
  },
  subtitle: {
    fontWeight: "300",
  },
  inputContainer: {
    marginBottom: 20,
  },
  forgotPassword: {
    textAlign: "right",
    color: "#0056D2",
    fontWeight: "600",
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  registerPrompt: {
    textAlign: "center",
    fontSize: 14,
    color: "#000000",
    marginTop: 20,
  },
  registerLink: {
    color: "#0056D2",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default Login;
