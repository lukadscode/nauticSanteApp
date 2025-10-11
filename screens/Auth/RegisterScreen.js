import React, { useState } from "react";
import {
  ActivityIndicator,
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
import Step1 from "./Signup/StepChooseFederation";
import Step2 from "./Signup/StepLicenceIdAndDate";
import Step3 from "./Signup/StepSetPassword";
import Step4 from "./Signup/StepVerifieLicence";
import CustomButton from "../../themes/ButtonBlue";
import API from "../../services/api";
import moment from "moment";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const SignUp = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    federation: "",
    licenseNumber: "",
    birthDate: "",
    verified: false,
    password: "",
    lastName: "",
    firstName: "",
    gender: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const goToNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const goToPreviousStep = () => {
    if (step > 1) setStep((prevStep) => prevStep - 1);
  };

  const handleConnectNav = () => {
    navigation.navigate("Login");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      let response;

      if (formData.federation === "ffaviron") {
        const payload = {
          licenseId: formData.licenseNumber,
          birthDate: formData.birthDate,
          password: formData.password,
          federation: "Aviron",
        };
        console.log("📤 Requête envoyée (ffaviron):", payload);

        response = await API.post("/auth/local/register", payload);
      } else {
        // Ici on n'essaie plus de reformatter, on garde tel quel (déjà correct)
        const formattedBirthDate = formData.birthDate;

        const payload = {
          birthDate: formattedBirthDate,
          federation: "Voile",
          nom: formData.lastName.trim(),
          prenom: formData.firstName.trim(),
          sexe: formData.gender,
          password: formData.password,
        };

        console.log("📤 Requête envoyée (voile):", payload);

        response = await API.post("/auth/local/register", payload);
      }

      console.log("✅ Réponse du serveur :", response.data);

      if (response.data.email) {
        setStep(5);
      } else {
        console.warn(
          "⚠️ Erreur dans la réponse :",
          response.data.error.message
        );
        setErrorMessage(response.data.error.message);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la requête :", error);
      if (error.response?.data?.error?.message) {
        setErrorMessage(error.response.data.error.message);
      } else {
        setErrorMessage("Erreur inconnue lors de l'enregistrement.");
      }
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
          {/* Logo at the top */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logos/logo_ns_v_b.png")}
              style={styles.logo}
            />
          </View>

          {/* Main content */}
          <View style={styles.content}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>Création de compte</Text>

              {step === 1 && (
                <Step1
                  formData={formData}
                  setFormData={setFormData}
                  onNext={goToNextStep}
                />
              )}
              {step === 2 && (
                <Step2
                  formData={formData}
                  setFormData={setFormData}
                  onNext={goToNextStep}
                  onBack={goToPreviousStep}
                />
              )}
              {step === 3 && (
                <Step3
                  formData={formData}
                  setFormData={setFormData}
                  onNext={goToNextStep}
                  onBack={goToPreviousStep}
                />
              )}
              {step === 4 && (
                <Step4
                  formData={formData}
                  setFormData={setFormData}
                  onNext={handleSubmit}
                  onBack={goToPreviousStep}
                />
              )}
              {step === 5 && (
                <View>
                  <Text style={styles.finalText}>
                    Vous avez reçu un mail de confirmation de compte. Veuillez
                    cliquer sur le lien avant de vous connecter.
                  </Text>
                  <CustomButton
                    title="Aller à la connexion"
                    onPress={() => navigation.navigate("Login")}
                  />
                </View>
              )}
              {loading && (
                <ActivityIndicator
                  size="large"
                  color="#FFFFFF"
                  style={styles.loader}
                />
              )}
              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              <Text style={styles.registerPrompt}>
                Vous avez déjà un compte ?{" "}
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.navigate("Login")}
                >
                  Connectez vous ici
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
    textAlign: "center",
  },
  finalText: {
    fontSize: 16,
    color: "#343D4F",
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  loginLink: {
    textAlign: "center",
    color: "#0056D2",
    fontWeight: "600",
    textDecorationLine: "underline",
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
  registerPrompt: {
    textAlign: "center",
    fontSize: 14,
    color: "#000000",
    marginTop: 20,
  },
});

export default SignUp;
