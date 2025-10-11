import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HealthIndexBar from "../themes/HealthIndexBar";
import questions from "../api/question";
import API from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

const HealthTestScreen = () => {
  const navigation = useNavigation();
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showImcInfo, setShowImcInfo] = useState(false);
  const appContext = useContext(AuthContext);
  const inputRefs = {};

  useEffect(() => {
    if (result) {
      API.post("/health-datas/", {
        data: {
          totalScore: result.totalScore,
          weight: answers.weight,
          height: answers.height,
        },
      });
    }
  }, [result]);

  const handleOptionSelect = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handlePersonalInput = (key, value) => {
    setAnswers({ ...answers, [key]: parseFloat(value) });
  };

  const calculateIMC = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / heightInMeters ** 2).toFixed(1);
  };

  const calculateResult = () => {
    const validValues = Object.values(answers).filter(
      (value) => typeof value === "number" && value <= 5
    );
    const totalScore = validValues.reduce((acc, value) => acc + value, 0);

    let resultLabel = "";
    if (totalScore < 18) resultLabel = "Inactif";
    else if (totalScore <= 35) resultLabel = "Actif";
    else resultLabel = "Très Actif";

    const weight = answers.weight || 0;
    const height = answers.height || 0;
    const imc = weight > 0 && height > 0 ? calculateIMC(weight, height) : "N/A";

    setResult({ totalScore, resultLabel, imc });
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion.isPersonal) {
      if (!answers.weight || !answers.height) {
        Alert.alert(
          "Erreur",
          "Veuillez renseigner votre poids et votre taille."
        );
        return;
      }
    } else if (answers[currentQuestion.id] == null) {
      Alert.alert("Erreur", "Veuillez sélectionner une réponse.");
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult();
    }
  };

  if (showIntro) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultTitle}>
            BIENVENUE DANS LE PROGRAMME NAUTIC’SANTÉ
          </Text>
          <Text style={styles.introText}>
            Merci de répondre le plus sincèrement possible aux questions qui
            vont suivre.{"\n\n"}
            Vos réponses vont nous permettre d’adapter les séances à vos besoins
            et de définir votre indice d’activité.{"\n\n"}
            Toutes vos données restent confidentielles et ne sont accessibles
            qu’aux coachs.
          </Text>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setShowIntro(false)}
          >
            <Text style={styles.nextButtonText}>Commencer le test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.laterText}>Faire plus tard</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (result) {
    const percentage = Math.min((result.totalScore / 45) * 100, 100);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultTitle}>Résultat</Text>
          <Ionicons
            name={
              result.resultLabel === "Très Actif"
                ? "happy-outline"
                : result.resultLabel === "Actif"
                ? "walk-outline"
                : "sad-outline"
            }
            size={80}
            color={
              result.resultLabel === "Très Actif"
                ? "#4CAF50"
                : result.resultLabel === "Actif"
                ? "#FFC107"
                : "#F44336"
            }
          />
          <Text style={styles.resultScore}>
            Score Total : {result.totalScore}
          </Text>
          <Text style={styles.resultLabel}>{result.resultLabel}</Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.resultIMC}>Votre IMC : {result.imc}</Text>
            <TouchableOpacity
              onPress={() => setShowImcInfo(true)}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="help-circle-outline" size={20} color="#8D95A7" />
            </TouchableOpacity>
          </View>

          <HealthIndexBar percentage={percentage} />

          <TouchableOpacity
            style={styles.restartButton}
            onPress={() => {
              appContext.setRefreshActivityScore((prev) => !prev);
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "BottomTabs",
                    state: {
                      index: 0,
                      routes: [{ name: "Accueil" }],
                    },
                  },
                ],
              });
            }}
          >
            <Text style={styles.restartButtonText}>Retour à l’accueil</Text>
          </TouchableOpacity>
        </ScrollView>

        {showImcInfo && (
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Interprétation de l'IMC</Text>
              <Text style={styles.modalText}>
                • &lt; 18.5 : Insuffisance pondérale{"\n"}• 18.5 - 24.9 : Normal
                {"\n"}• 25 - 29.9 : Surpoids{"\n"}• 30+ : Obésité
              </Text>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={() => setShowImcInfo(false)}
              >
                <Text style={styles.restartButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{currentQuestion.category}</Text>
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {currentQuestion.question}
              </Text>
              {currentQuestion.isPersonal
                ? currentQuestion.inputs.map((input, index) => (
                    <View key={input.key} style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>{input.label}</Text>
                      <TextInput
                        ref={(ref) => (inputRefs[input.key] = ref)}
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder={`Entrez votre ${input.label.toLowerCase()}`}
                        onChangeText={(text) =>
                          handlePersonalInput(input.key, text)
                        }
                        value={answers[input.key]?.toString() || ""}
                      />
                    </View>
                  ))
                : currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        answers[currentQuestion.id] === option.value &&
                          styles.selectedOption,
                      ]}
                      onPress={() =>
                        handleOptionSelect(currentQuestion.id, option.value)
                      }
                    >
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={
                          answers[currentQuestion.id] === option.value
                            ? "#fff"
                            : "#1E283C"
                        }
                        style={styles.optionIcon}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          answers[currentQuestion.id] === option.value &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === questions.length - 1
                ? "Voir le Résultat"
                : "Suivant"}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f9ff", padding: 20 },
  header: { marginBottom: 20 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    textAlign: "center",
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: { marginBottom: 20, width: "90%" },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#EDEFF3",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: "#1E283C",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDEFF3",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: "90%",
  },
  selectedOption: { backgroundColor: "#1E283C" },
  optionIcon: { marginRight: 10 },
  optionText: { fontSize: 16, fontWeight: "600", color: "#8D95A7" },
  selectedOptionText: { color: "#FFFFFF" },
  nextButton: {
    backgroundColor: "#1E283C",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8D95A7",
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 20,
  },
  resultIMC: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8D95A7",
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: "#F76C6A",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  restartButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 10,
  },
  modalText: { fontSize: 14, color: "#1E283C", marginBottom: 15 },
  introText: {
    fontSize: 16,
    color: "#1E283C",
    textAlign: "center",
    marginBottom: 20,
  },
  laterText: { color: "#8D95A7", textDecorationLine: "underline" },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2167b1",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  introText: {
    fontSize: 16,
    color: "#1e293b",
    textAlign: "justify",
    paddingHorizontal: 20,
    lineHeight: 24,
  },

  nextButton: {
    backgroundColor: "#2167b1",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 30,
    alignSelf: "center",
  },

  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  laterText: {
    color: "#888",
    textAlign: "center",
    fontSize: 14,
  },
});

export default HealthTestScreen;
