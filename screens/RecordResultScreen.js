import React, { useContext, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../themes/ButtonBlue";
import CustomInput from "../themes/Input";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const moodLabels = {
  1: "L’intensité de la séance était faible",
  2: "L’intensité de la séance était modérée",
  3: "L’intensité de la séance était difficile",
  4: "L’intensité de la séance était très difficile",
};

const RecordResultScreen = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const calendarEl = route.params?.calendarEl;
  const appContext = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const duration = moment.duration(calendarEl?.duration ?? 0, "seconds");

  const [date, setDate] = useState(moment(calendarEl?.date));
  const [time, setTime] = useState(
    moment.utc(duration.asMilliseconds()).format("HH:mm:ss")
  );
  const [distance, setDistance] = useState("");
  const [mood, setMood] = useState(null);

  const validateForm = () => {
    if (!date || !time || !mood) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return false;
    }
    return true;
  };

  const handleSaveResult = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const resultData = {
      date,
      realDuration: moment.duration(time).asSeconds(),
      distance,
      mood,
      state: "finished",
    };

    try {
      if (calendarEl?.documentId) {
        await API.put("/calendar-elements/" + calendarEl.documentId, {
          data: resultData,
        });
      } else {
        resultData.exerciseDocumentId = calendarEl.exerciseDocumentId;
        await API.post("/calendar-element/createMyActivityElement", resultData);
        appContext.setRefreshTraining(!appContext.refreshTraining);
      }
      appContext.setRefreshActivityScore(!appContext.refreshActivityScore);

      Alert.alert("Succès", "Résultat enregistré avec succès !");
      navigation.navigate("Main");
    } catch (e) {
      console.error(e.response?.data || e.message);
      Alert.alert("Erreur", "Échec de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  if (!calendarEl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur : Données introuvables.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <Text style={{ color: "#1E283C", fontSize: 16, fontWeight: "600" }}>
              Enregistrement en cours...
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.backHeaderWrapper, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1E283C" />
        </TouchableOpacity>
        <Text style={styles.backHeaderTitle}>Résultat</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sessionCard}>
          <Text style={styles.sessionLabel}>Séance :</Text>
          <Text style={styles.sessionName}>
            {calendarEl.session?.name || "Séance inconnue"}
          </Text>
        </View>

        <CustomInput
          label="Date*"
          isDateInput
          value={date.format("DD/MM/YYYY")}
          onChangeText={(date) => setDate(moment(date, "DD/MM/YYYY"))}
        />
        <CustomInput
          label="Temps (hh:mm:ss)*"
          placeholder="hh:mm:ss"
          isTimeInput
          value={time}
          onChangeText={setTime}
        />
        <CustomInput
          label="Distance (km)"
          placeholder="Ex : 5.0"
          isNumeric
          value={distance}
          onChangeText={setDistance}
        />

        <View style={styles.ratingContainer}>
          <Text style={styles.inputLabel}>Sentiment de la séance*</Text>
          <View style={styles.ratingEmojis}>
            {["🙃", "😅", "🥵", "🤯"].map((emoji, index) => (
              <TouchableOpacity key={index} onPress={() => setMood(index + 1)}>
                <Text
                  style={{
                    fontSize: 30,
                    marginHorizontal: 10,
                    opacity: mood === index + 1 ? 1 : 0.5,
                  }}
                >
                  {emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {mood ? (
            <Text style={styles.sentimentLabel}>{moodLabels[mood]}</Text>
          ) : (
            <View style={styles.emptySentimentLabel}></View>
          )}
        </View>

        <CustomButton
          title="💾 Enregistrer le résultat"
          onPress={handleSaveResult}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f9ff" },
  scrollArea: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  backHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#f4f9ff",
  },
  backHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E283C",
    marginLeft: 8,
  },
  sessionCard: {
    backgroundColor: "#e6f0fb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sessionLabel: {
    fontSize: 14,
    color: "#8D95A7",
    marginBottom: 4,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 8,
  },
  ratingContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  ratingEmojis: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  sentimentLabel: {
    marginTop: 10,
    fontSize: 14,
    fontStyle: "italic",
    color: "#1E283C",
  },
  emptySentimentLabel: {
    marginTop: 27,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loaderBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
});

export default RecordResultScreen;
