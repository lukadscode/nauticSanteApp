import React, { useContext, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const moodData = [
  {
    id: 1,
    emoji: "😊",
    label: "Facile",
    description: "L'intensité était faible",
    color: "#4CAF50",
    bgColor: "#E8F5E9",
  },
  {
    id: 2,
    emoji: "😅",
    label: "Modérée",
    description: "L'intensité était modérée",
    color: "#FF9800",
    bgColor: "#FFF3E0",
  },
  {
    id: 3,
    emoji: "🥵",
    label: "Difficile",
    description: "L'intensité était difficile",
    color: "#FF6B6B",
    bgColor: "#FFE5E5",
  },
  {
    id: 4,
    emoji: "🤯",
    label: "Très difficile",
    description: "L'intensité était très difficile",
    color: "#F44336",
    bgColor: "#FFEBEE",
  },
];

const RecordResultScreen = ({ route }) => {
  const navigation = useNavigation();
  const calendarEl = route.params?.calendarEl;
  const appContext = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const duration = moment.duration(calendarEl?.duration ?? 0, "seconds");

  const [date, setDate] = useState(moment(calendarEl?.date));
  const [hours, setHours] = useState(Math.floor(duration.asHours()).toString().padStart(2, "0"));
  const [minutes, setMinutes] = useState((duration.minutes()).toString().padStart(2, "0"));
  const [seconds, setSeconds] = useState((duration.seconds()).toString().padStart(2, "0"));
  const [distance, setDistance] = useState("");
  const [mood, setMood] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateForm = () => {
    if (!mood) {
      Alert.alert("Champ requis", "Veuillez indiquer le ressenti de votre séance.");
      return false;
    }
    if (!hours && !minutes && !seconds) {
      Alert.alert("Champ requis", "Veuillez indiquer la durée de votre séance.");
      return false;
    }
    return true;
  };

  const handleSaveResult = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const totalSeconds =
      parseInt(hours || 0) * 3600 +
      parseInt(minutes || 0) * 60 +
      parseInt(seconds || 0);

    const resultData = {
      date: date.toISOString(),
      realDuration: totalSeconds,
      distance: distance ? parseFloat(distance) : null,
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

      Alert.alert(
        "Enregistré",
        "Votre séance a été enregistrée avec succès !",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Main"),
          },
        ]
      );
    } catch (e) {
      console.error(e.response?.data || e.message);
      Alert.alert("Erreur", "Impossible d'enregistrer votre résultat.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate && event.type !== "dismissed") {
      setDate(moment(selectedDate));
    }
  };

  if (!calendarEl) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>Données introuvables</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedMood = moodData.find((m) => m.id === mood);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enregistrer le résultat</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sessionCard}>
          <View style={styles.sessionIconContainer}>
            <Ionicons name="barbell" size={24} color="#2167b1" />
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionLabel}>Séance</Text>
            <Text style={styles.sessionName}>
              {calendarEl.session?.name || "Séance personnalisée"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date de la séance</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#2167b1" />
            <Text style={styles.dateText}>
              {date.format("dddd DD MMMM YYYY")}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#8D95A7" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Durée de la séance <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.timeInputsRow}>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                keyboardType="numeric"
                maxLength={2}
                value={hours}
                onChangeText={(text) => setHours(text.replace(/\D/g, ""))}
                placeholder="00"
                placeholderTextColor="#B0B9C8"
              />
              <Text style={styles.timeLabel}>h</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                keyboardType="numeric"
                maxLength={2}
                value={minutes}
                onChangeText={(text) => setMinutes(text.replace(/\D/g, ""))}
                placeholder="00"
                placeholderTextColor="#B0B9C8"
              />
              <Text style={styles.timeLabel}>min</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                keyboardType="numeric"
                maxLength={2}
                value={seconds}
                onChangeText={(text) => setSeconds(text.replace(/\D/g, ""))}
                placeholder="00"
                placeholderTextColor="#B0B9C8"
              />
              <Text style={styles.timeLabel}>sec</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance parcourue</Text>
          <View style={styles.distanceInputContainer}>
            <Ionicons name="navigate-outline" size={20} color="#8D95A7" />
            <TextInput
              style={styles.distanceInput}
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={setDistance}
              placeholder="Ex : 5.5"
              placeholderTextColor="#B0B9C8"
            />
            <Text style={styles.distanceUnit}>km</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ressenti de la séance <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Comment avez-vous trouvé cette séance ?
          </Text>
          <View style={styles.moodGrid}>
            {moodData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.moodCard,
                  { backgroundColor: item.bgColor },
                  mood === item.id && [
                    styles.moodCardSelected,
                    { borderColor: item.color },
                  ],
                ]}
                onPress={() => setMood(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
                <Text style={[styles.moodLabel, { color: item.color }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedMood && (
            <View style={[styles.moodDescription, { backgroundColor: selectedMood.bgColor }]}>
              <Ionicons name="information-circle" size={18} color={selectedMood.color} />
              <Text style={[styles.moodDescriptionText, { color: selectedMood.color }]}>
                {selectedMood.description}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{date.format("DD/MM/YYYY")}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Durée</Text>
            <Text style={styles.summaryValue}>
              {hours}h {minutes}min {seconds}s
            </Text>
          </View>
          {distance && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Distance</Text>
              <Text style={styles.summaryValue}>{distance} km</Text>
            </View>
          )}
          {selectedMood && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ressenti</Text>
              <View style={styles.summaryMood}>
                <Text style={styles.summaryMoodEmoji}>{selectedMood.emoji}</Text>
                <Text style={styles.summaryValue}>{selectedMood.label}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveResult}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.saveButtonText}>Enregistrement...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Enregistrer la séance</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {showDatePicker && Platform.OS === "ios" && (
        <Modal transparent animationType="slide" visible={showDatePicker}>
          <View style={styles.modalBackground}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Sélectionner une date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerDone}>Terminé</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date.toDate()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                themeVariant="light"
              />
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={date.toDate()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          themeVariant="light"
        />
      )}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sessionCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sessionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
    justifyContent: "center",
  },
  sessionLabel: {
    fontSize: 12,
    color: "#8D95A7",
    marginBottom: 4,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#8D95A7",
    marginBottom: 12,
  },
  required: {
    color: "#F44336",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: "#1E283C",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  timeInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeInputContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E283C",
    textAlign: "center",
    width: "100%",
  },
  timeLabel: {
    fontSize: 12,
    color: "#8D95A7",
    marginTop: 4,
    fontWeight: "600",
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8D95A7",
    marginHorizontal: 8,
  },
  distanceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  distanceInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E283C",
    fontWeight: "600",
  },
  distanceUnit: {
    fontSize: 16,
    color: "#8D95A7",
    fontWeight: "600",
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moodCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodCardSelected: {
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  moodDescription: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  moodDescriptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F7FA",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#8D95A7",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E283C",
  },
  summaryMood: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryMoodEmoji: {
    fontSize: 18,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#2167b1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2167b1",
  },
});

export default RecordResultScreen;
