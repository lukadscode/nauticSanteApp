import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import API from "../services/api";
import { convertSecToHumanTiming } from "../services/utils";
import CustomInput from "../themes/Input";
import CustomButton from "../themes/ButtonBlue";

const moodLabels = {
  1: "L'intensité de la séance était faible",
  2: "L'intensité de la séance était modérée",
  3: "L'intensité de la séance était difficile",
  4: "L'intensité de la séance était très difficile",
};

const TrainingHistoryDetailScreen = ({ route, navigation }) => {
  const { workout } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState({
    date: moment(workout.date),
    time: moment
      .utc(moment.duration(workout.realDuration || workout.duration, "seconds").asMilliseconds())
      .format("HH:mm:ss"),
    distance: workout.distance?.toString() || "",
    mood: workout.mood || null,
  });
  const [loading, setLoading] = useState(false);

  const getMoodEmoji = (mood) => {
    const emojis = ["🙃", "😅", "🥵", "🤯"];
    return emojis[mood - 1] || "😐";
  };

  const handleSaveEdit = async () => {
    if (!editedWorkout.time || !editedWorkout.mood) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const resultData = {
        date: editedWorkout.date.format("YYYY-MM-DD"),
        realDuration: moment.duration(editedWorkout.time).asSeconds(),
        distance: editedWorkout.distance,
        mood: editedWorkout.mood,
        state: "finished",
      };

      await API.put("/calendar-elements/" + workout.documentId, {
        data: resultData,
      });

      Alert.alert("Succès", "Résultat modifié avec succès !");
      setIsEditing(false);
      navigation.goBack();
    } catch (error) {
      console.error("Erreur modification:", error);
      Alert.alert("Erreur", "Impossible de modifier le résultat.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer l'entraînement",
      "Êtes-vous sûr de vouloir supprimer cet entraînement ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete("/calendar-elements/" + workout.documentId);
              Alert.alert("Succès", "Entraînement supprimé.");
              navigation.goBack();
            } catch (error) {
              console.error("Erreur suppression:", error);
              Alert.alert("Erreur", "Impossible de supprimer l'entraînement.");
            }
          },
        },
      ]
    );
  };

  const renderViewMode = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations générales</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#2167b1" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {moment(workout.date).format("DD MMMM YYYY")}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#2167b1" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Durée</Text>
              <Text style={styles.infoValue}>
                {convertSecToHumanTiming(workout.realDuration || workout.duration)}
              </Text>
            </View>
          </View>

          {workout.distance && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Ionicons name="navigate-outline" size={20} color="#2167b1" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{workout.distance} km</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="fitness-outline" size={20} color="#2167b1" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Catégorie</Text>
              <Text style={styles.infoValue}>
                {workout.session?.category || "Sport"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {workout.mood && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ressenti</Text>
          <View style={styles.moodCard}>
            <Text style={styles.moodEmojiLarge}>{getMoodEmoji(workout.mood)}</Text>
            <Text style={styles.moodLabel}>{moodLabels[workout.mood]}</Text>
          </View>
        </View>
      )}

      {workout.session && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la séance</Text>
          <View style={styles.sessionCard}>
            <Text style={styles.sessionName}>{workout.session.name}</Text>
            {workout.session.description && (
              <Text style={styles.sessionDescription}>
                {workout.session.description}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#FF4C4C" />
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderEditMode = () => (
    <>
      <View style={styles.editSection}>
        <CustomInput
          label="Date*"
          isDateInput
          value={editedWorkout.date.format("DD/MM/YYYY")}
          onChangeText={(date) =>
            setEditedWorkout({
              ...editedWorkout,
              date: moment(date, "DD/MM/YYYY"),
            })
          }
        />

        <CustomInput
          label="Temps (hh:mm:ss)*"
          placeholder="hh:mm:ss"
          isTimeInput
          value={editedWorkout.time}
          onChangeText={(time) =>
            setEditedWorkout({ ...editedWorkout, time })
          }
        />

        <CustomInput
          label="Distance (km)"
          placeholder="Ex : 5.0"
          isNumeric
          value={editedWorkout.distance}
          onChangeText={(distance) =>
            setEditedWorkout({ ...editedWorkout, distance })
          }
        />

        <View style={styles.ratingContainer}>
          <Text style={styles.inputLabel}>Sentiment de la séance*</Text>
          <View style={styles.ratingEmojis}>
            {["🙃", "😅", "🥵", "🤯"].map((emoji, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  setEditedWorkout({ ...editedWorkout, mood: index + 1 })
                }
              >
                <Text
                  style={{
                    fontSize: 30,
                    marginHorizontal: 10,
                    opacity: editedWorkout.mood === index + 1 ? 1 : 0.5,
                  }}
                >
                  {emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {editedWorkout.mood && (
            <Text style={styles.sentimentLabel}>
              {moodLabels[editedWorkout.mood]}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.editActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setIsEditing(false)}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <CustomButton title="Enregistrer" onPress={handleSaveEdit} />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <Text style={styles.loaderText}>Enregistrement en cours...</Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Modifier" : "Détails"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.workoutTitle}>
            {workout.session?.name || "Séance personnalisée"}
          </Text>
        </View>

        {isEditing ? renderEditMode() : renderViewMode()}
      </ScrollView>
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
    borderBottomColor: "#E0E0E0",
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E283C",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#8D95A7",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  moodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmojiLarge: {
    fontSize: 64,
    marginBottom: 15,
  },
  moodLabel: {
    fontSize: 16,
    color: "#1E283C",
    textAlign: "center",
    fontStyle: "italic",
  },
  sessionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: "#8D95A7",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2167b1",
    borderRadius: 12,
    paddingVertical: 15,
    gap: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 15,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FF4C4C",
  },
  deleteButtonText: {
    color: "#FF4C4C",
    fontSize: 16,
    fontWeight: "600",
  },
  editSection: {
    gap: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 8,
  },
  ratingContainer: {
    alignItems: "center",
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
  editActions: {
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1E283C",
    fontSize: 16,
    fontWeight: "600",
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
  loaderText: {
    color: "#1E283C",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TrainingHistoryDetailScreen;
