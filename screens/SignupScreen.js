import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Step1 from "./Signup/StepChooseFederation";
import Step2 from "./Signup/StepLicenceIdAndDate";
import Step3 from "./Signup/StepVerifieLicence";
import CustomButton from "../themes/ButtonBlue";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const SignUp = ({ navigation }) => {
  const [step, setStep] = useState(1); // État pour suivre l’étape actuelle
  const [formData, setFormData] = useState({
    federation: "",
    licenseNumber: "",
    birthDate: "",
    verified: false,
  });

  const goToNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const goToPreviousStep = () => {
    if (step > 1) setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    navigation.navigate("Home");
  };

  return (
    <LinearGradient colors={["#4A90E2", "#6ABAF5"]} style={styles.container}>
      {/* Logo au centre */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logos/logo_ns_v_b.png")}
          style={styles.logo}
        />
        <Text style={styles.appName}>Nautic'Santé</Text>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            <View>
              <Text style={styles.finalText}>
                Merci de créer votre compte ! Vous êtes prêt à commencer.
              </Text>
              <CustomButton title="Aller à l'accueil" onPress={handleSubmit} />
            </View>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
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
    width: 210,
    height: 120,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 10,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 30,
    marginTop: screenHeight * 0.02,
    elevation: 5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  finalText: {
    fontSize: 16,
    color: "#343D4F",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default SignUp;
