import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import moment from "moment";
import { Picker } from "@react-native-picker/picker";

const HealthQuestionInputScreen = ({ route }) => {
  const { questionSlug } = route.params;
  const [forms, setForms] = useState([]);
  const [question, setQuestion] = useState({});

  const [value, setValue] = useState("");
  const [selectValue, setSelectValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const appContext = useContext(AuthContext);
  const userAge = moment().diff(
    moment(appContext.user.birthDate, "YYYY-MM-DD"),
    "years"
  );

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    const question = forms.find((form) => form.slug === questionSlug) ?? {
      title: "Évaluation inconnue",
      description: "",
      icon: "help-circle-outline",
    };
    setQuestion(question);
  }, [forms]);

  const loadForms = async () => {
    const forms = (await API.get("/forms")).data.data;
    setForms(forms);
  };

  const handleSave = async () => {
    if (!value && !selectValue) {
      Alert.alert("Erreur", "Veuillez répondre à la question.");
      return;
    }

    setLoading(true);
    let score = 0;

    switch (questionSlug) {
      case "equilibre":
        if (appContext.user.civility === "Homme") {
          if (userAge >= 51) {
            if (value >= 60) {
              score = 5;
            } else if (value >= 35) {
              score = 3;
            } else {
              score = 1;
            }
          } else {
            if (value >= 60) {
              score = 5;
            } else {
              score = 1;
            }
          }
        } else if (appContext.user.civility === "Femme") {
          if (userAge >= 61) {
            if (value >= 60) {
              score = 5;
            } else if (value >= 35) {
              score = 4;
            } else if (value >= 18) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 51) {
            if (value >= 60) {
              score = 5;
            } else if (value >= 35) {
              score = 3;
            } else {
              score = 1;
            }
          } else {
            if (value >= 60) {
              score = 5;
            } else {
              score = 1;
            }
          }
        }
        break;
      case "souplesse":
        score = selectValue;
        break;
      case "force-bras":
        if (appContext.user.civility === "Homme") {
          if (userAge >= 61) {
            if (value >= 46) {
              score = 5;
            } else if (value >= 41) {
              score = 4;
            } else if (value >= 38) {
              score = 3;
            } else if (value >= 34) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 51) {
            if (value >= 50) {
              score = 5;
            } else if (value >= 47) {
              score = 4;
            } else if (value >= 44) {
              score = 3;
            } else if (value >= 40) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 41) {
            if (value >= 53) {
              score = 5;
            } else if (value >= 50) {
              score = 4;
            } else if (value >= 47) {
              score = 3;
            } else if (value >= 41) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 31) {
            if (value >= 57) {
              score = 5;
            } else if (value >= 51) {
              score = 4;
            } else if (value >= 46) {
              score = 3;
            } else if (value >= 44) {
              score = 2;
            } else {
              score = 1;
            }
          } else {
            if (value >= 57) {
              score = 5;
            } else if (value >= 52) {
              score = 4;
            } else if (value >= 48) {
              score = 3;
            } else if (value >= 45) {
              score = 2;
            } else {
              score = 1;
            }
          }
        } else if (appContext.user.civility === "Femme") {
          if (userAge >= 61) {
            if (value >= 27) {
              score = 5;
            } else if (value >= 25) {
              score = 4;
            } else if (value >= 22) {
              score = 3;
            } else if (value >= 20) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 51) {
            if (value >= 30) {
              score = 5;
            } else if (value >= 27) {
              score = 4;
            } else if (value >= 24) {
              score = 3;
            } else if (value >= 21) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 41) {
            if (value >= 33) {
              score = 5;
            } else if (value >= 30) {
              score = 4;
            } else if (value >= 27) {
              score = 3;
            } else if (value >= 24) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 31) {
            if (value >= 34) {
              score = 5;
            } else if (value >= 31) {
              score = 4;
            } else if (value >= 28) {
              score = 3;
            } else if (value >= 25) {
              score = 2;
            } else {
              score = 1;
            }
          } else {
            if (value >= 34) {
              score = 5;
            } else if (value >= 31) {
              score = 4;
            } else if (value >= 29) {
              score = 3;
            } else if (value >= 25) {
              score = 2;
            } else {
              score = 1;
            }
          }
        }
        break;
      case "force-jambes":
        if (appContext.user.civility === "Homme") {
          if (userAge >= 61) {
            if (value >= 19) {
              score = 5;
            } else if (value >= 16) {
              score = 4;
            } else if (value >= 13) {
              score = 3;
            } else if (value >= 9) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 51) {
            if (value >= 21) {
              score = 5;
            } else if (value >= 16) {
              score = 4;
            } else if (value >= 14) {
              score = 3;
            } else if (value >= 11) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 41) {
            if (value >= 25) {
              score = 5;
            } else if (value >= 21) {
              score = 4;
            } else if (value >= 19) {
              score = 3;
            } else if (value >= 17) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 31) {
            if (value >= 34) {
              score = 5;
            } else if (value >= 33) {
              score = 4;
            } else if (value >= 31) {
              score = 3;
            } else if (value >= 20) {
              score = 2;
            } else {
              score = 1;
            }
          } else {
            if (value >= 33) {
              score = 5;
            } else if (value >= 25) {
              score = 4;
            } else if (value >= 20) {
              score = 3;
            } else if (value >= 17) {
              score = 2;
            } else {
              score = 1;
            }
          }
        } else if (appContext.user.civility === "Femme") {
          if (userAge >= 61) {
            if (value >= 16) {
              score = 5;
            } else if (value >= 14) {
              score = 4;
            } else if (value >= 12) {
              score = 3;
            } else if (value >= 10) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 51) {
            if (value >= 17) {
              score = 5;
            } else if (value >= 15) {
              score = 4;
            } else if (value >= 13) {
              score = 3;
            } else if (value >= 10) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 41) {
            if (value >= 23) {
              score = 5;
            } else if (value >= 20) {
              score = 4;
            } else if (value >= 17) {
              score = 3;
            } else if (value >= 14) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 31) {
            if (value >= 26) {
              score = 5;
            } else if (value >= 20) {
              score = 4;
            } else if (value >= 18) {
              score = 3;
            } else if (value >= 15) {
              score = 2;
            } else {
              score = 1;
            }
          } else {
            if (value >= 33) {
              score = 5;
            } else if (value >= 27) {
              score = 4;
            } else if (value >= 22) {
              score = 3;
            } else if (value >= 19) {
              score = 2;
            } else {
              score = 1;
            }
          }
        }
        break;
      case "endurance":
        if (appContext.user.civility === "Homme") {
          if (userAge >= 61) {
            if (value >= 1150) {
              score = 5;
            } else if (value >= 1100) {
              score = 4;
            } else if (value >= 1050) {
              score = 3;
            } else if (value >= 1000) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 51) {
            if (value >= 1200) {
              score = 5;
            } else if (value >= 1150) {
              score = 4;
            } else if (value >= 1100) {
              score = 3;
            } else if (value >= 1050) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 41) {
            if (value >= 1250) {
              score = 5;
            } else if (value >= 1200) {
              score = 4;
            } else if (value >= 1150) {
              score = 3;
            } else if (value >= 1100) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 31) {
            if (value >= 1300) {
              score = 5;
            } else if (value >= 1250) {
              score = 4;
            } else if (value >= 1200) {
              score = 3;
            } else if (value >= 1150) {
              score = 2;
            } else {
              score = 1;
            }
          } else {
            if (value >= 1350) {
              score = 5;
            } else if (value >= 1300) {
              score = 4;
            } else if (value >= 1250) {
              score = 3;
            } else if (value >= 1200) {
              score = 2;
            } else {
              score = 1;
            }
          }
        } else if (appContext.user.civility === "Femme") {
          if (userAge >= 61) {
            if (value >= 1050) {
              score = 5;
            } else if (value >= 1000) {
              score = 4;
            } else if (value >= 950) {
              score = 3;
            } else if (value >= 900) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 51) {
            if (value >= 1100) {
              score = 5;
            } else if (value >= 1050) {
              score = 4;
            } else if (value >= 1000) {
              score = 3;
            } else if (value >= 950) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 41) {
            if (value >= 1150) {
              score = 5;
            } else if (value >= 1100) {
              score = 4;
            } else if (value >= 1050) {
              score = 3;
            } else if (value >= 1000) {
              score = 2;
            } else {
              score = 1;
            }
          } else if (userAge >= 31) {
            if (value >= 1200) {
              score = 5;
            } else if (value >= 1150) {
              score = 4;
            } else if (value >= 1100) {
              score = 3;
            } else if (value >= 1050) {
              score = 2;
            } else {
              score = 1;
            }
          } else {
            if (value >= 1250) {
              score = 5;
            } else if (value >= 1200) {
              score = 4;
            } else if (value >= 1150) {
              score = 3;
            } else if (value >= 1100) {
              score = 2;
            } else {
              score = 1;
            }
          }
        }
        break;
    }

    try {
      await API.post("/form-results/createMyElement", {
        value,
        score,
        form: questionSlug,
      });

      appContext.setRefreshFormScan(!appContext.refreshFormScan);

      Alert.alert("Enregistré", `Votre score est : ${score} sur 5`, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer votre résultat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle évaluation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          {question.icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={question.icon} size={32} color="#2167b1" />
            </View>
          )}
          <Text style={styles.questionTitle}>{question?.title}</Text>
          {question?.description && (
            <Text style={styles.questionDescription}>{question?.description}</Text>
          )}
        </View>

        <View style={styles.formContainer}>
          {questionSlug === "souplesse" ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sélectionnez votre niveau</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectValue}
                  onValueChange={(itemValue) => setSelectValue(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Choisissez une option..." value={0} />
                  <Picker.Item label="Toucher le sol doigts fermés" value={5} />
                  <Picker.Item label="Le bout des doigts touche le sol" value={4} />
                  <Picker.Item
                    label="Le bout des doigts touche le cou de pied"
                    value={3}
                  />
                  <Picker.Item
                    label="Le bout des doigts atteint le bas des tibias"
                    value={2}
                  />
                  <Picker.Item
                    label="Le bout des doigts atteint le milieu des tibias"
                    value={1}
                  />
                </Picker>
              </View>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Indiquez votre score</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="create-outline" size={20} color="#8D95A7" />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre valeur"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={setValue}
                  placeholderTextColor="#B0B9C8"
                />
              </View>
              <Text style={styles.hint}>
                {questionSlug === "equilibre" && "En secondes (ex: 45)"}
                {questionSlug === "force-bras" && "Nombre de répétitions"}
                {questionSlug === "force-jambes" && "Nombre de répétitions"}
                {questionSlug === "endurance" && "Distance en mètres (ex: 1200)"}
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#2167b1" />
            <Text style={styles.infoText}>
              Votre score sera calculé automatiquement en fonction de votre âge et sexe
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.saveButtonText}>Enregistrement...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E6F0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E283C",
    textAlign: "center",
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 14,
    color: "#8D95A7",
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    padding: 20,
    paddingTop: 10,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#E0E6F0",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E283C",
    paddingVertical: 14,
    paddingLeft: 10,
  },
  hint: {
    fontSize: 12,
    color: "#8D95A7",
    marginTop: 8,
    fontStyle: "italic",
  },
  pickerWrapper: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E6F0",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 15,
    gap: 10,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E283C",
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#2167b1",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2167b1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: "#B0B9C8",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

export default HealthQuestionInputScreen;
