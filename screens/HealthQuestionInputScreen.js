import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
        } else if (user.civility === "Femme") {
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
        } else if (user.civility === "Femme") {
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
        } else if (user.civility === "Femme") {
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
        } else if (user.civility === "Femme") {
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

    await API.post("/form-results/createMyElement", {
      value,
      score,
      form: questionSlug,
    });

    appContext.setRefreshFormScan(!appContext.refreshFormScan);

    Alert.alert("✅ Enregistré", `Score : ${score}`, [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color="#1E283C" />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      {/* Question card */}
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Ionicons name={question.icon} size={32} color="#2167b1" />
        </View>
        <Text style={styles.title}>{question?.title}</Text>
        <Text style={styles.description}>{question?.description}</Text>
      </View>
      {/* response card */}
      {questionSlug === "souplesse" ? (
        <Picker
          selectedValue={selectValue}
          onValueChange={(itemValue) => setSelectValue(itemValue)}
        >
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
            label="Le bout des doigts atteints le milieu des tibias"
            value={1}
          />
        </Picker>
      ) : (
        <>
          {/* Input field */}
          <Text style={styles.label}>Indiquez votre score :</Text>
          <TextInput
            style={styles.input}
            placeholder="ex : 3"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />
        </>
      )}

      {/* Save button */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>💾 Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f9ff",
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    color: "#1E283C",
    marginLeft: 5,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#e6f0fb",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    backgroundColor: "#d1e5fc",
    alignSelf: "flex-start",
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: "#495867",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderColor: "#cfd8dc",
    borderWidth: 1,
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#2167b1",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

export default HealthQuestionInputScreen;
