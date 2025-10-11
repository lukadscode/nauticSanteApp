import React, {useContext, useState} from "react";
import {Modal, Pressable, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {getCardColorsByState, getSessionStateColor, translateSessionState} from "../services/utils";
import API from "../services/api";
import {AuthContext} from "../context/AuthContext";

const ExerciseLightCard = ({exercise, calendarEl, index = 0}) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const appContext = useContext(AuthContext)

  const color = getCardColorsByState(calendarEl?.state);

  const activity = exercise.tags?.find((tag) => tag.type === "activity");
  const difficulty = exercise.tags?.find((tag) => tag.type === "difficulty");

  const handleViewDetails = () => {
    setModalVisible(false);
    if (exercise.videos.length > 0) {
      navigation.navigate("VideoExerciseScreen", {
        exercise
      });
    } else {
      //TODO ajout page détail exo
      //navigation.navigate("TrainingSessionScreen", {exercise, calendarEl});
    }

  };

  const handleStartSession = () => {
    setModalVisible(false);
    if (exercise.videos.length > 0) {
      navigation.navigate("VideoExerciseScreen", {
        exercise
      });
    } else {
      //TODO ajout page détail exo
      //navigation.navigate("TrainingSessionScreen", {exercise, calendarEl});
    }
  };

  const handleDelete = async () => {
    setModalVisible(false);
    await API.delete('/calendar-elements/' + calendarEl.documentId)
    appContext.setRefreshTraining(!appContext.refreshTraining)
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleViewDetails}
        style={[styles.card, {backgroundColor: color.backgroundColor}]}
      >
        <View style={styles.topRow}>
          <Text style={[styles.title, {color: color.textColor}]}>
            {exercise.name}
          </Text>
          <View style={styles.topRight}>
            <View
              style={[
                styles.badge,
                {backgroundColor: getSessionStateColor(calendarEl?.state)},
              ]}
            >
              <Text style={styles.badgeText}>
                {translateSessionState(calendarEl?.state)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                style={styles.icon}
                color={color.textColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {activity && (
          <Text style={[styles.detail, {color: color.textColor}]}>
            🎯 Thème : {activity.name}
          </Text>
        )}

        {difficulty && (
          <Text style={[styles.detail, {color: color.textColor}]}>
            🧩 Niveau : {difficulty.name}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={handleViewDetails}
            >
              <Ionicons name="eye-outline" size={20} color="#1E283C"/>
              <Text style={styles.modalText}>Voir les détails</Text>
            </TouchableOpacity>

            {calendarEl.state === 'planned' &&
              <TouchableOpacity
                style={styles.modalItem}
                onPress={handleStartSession}
              >
                <Ionicons name="play-outline" size={20} color="#1E283C"/>
                <Text style={styles.modalText}>Démarrer l'exercice</Text>
              </TouchableOpacity>
            }
            {calendarEl.state === 'finished' &&
              <TouchableOpacity
                style={styles.modalItem}
                onPress={handleAddToCalendar}
              >
                <Ionicons name="calendar-outline" size={20} color="#1E283C"/>
                <Text style={styles.modalText}>Reprogrammer</Text>
              </TouchableOpacity>
            }

            <TouchableOpacity style={styles.modalItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#F44336"/>
              <Text style={[styles.modalText, {color: "#F44336"}]}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  detail: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  modalText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
  },
  icon: {
    padding: 4
  }
});

export default ExerciseLightCard;
