import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import moment from "moment";
import "moment/locale/fr";
import WorkoutCard from "../../themes/SessionCard"; // Assurez-vous que le chemin est correct
import workoutsData from "../../api/workout.json";

moment.locale("fr");

const MonthlyCalendarScreen = () => {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Convertir les données en un format indexé par date
  const workouts = workoutsData.sessions.reduce((acc, session) => {
    const date = moment(session.date).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const daysInMonth = Array.from(
    { length: currentMonth.daysInMonth() },
    (_, i) => currentMonth.clone().startOf("month").add(i, "days")
  );

  const goToPreviousMonth = () =>
    setCurrentMonth(currentMonth.clone().subtract(1, "month"));
  const goToNextMonth = () =>
    setCurrentMonth(currentMonth.clone().add(1, "month"));

  const openDayDetails = (day) => {
    const formattedDate = day.format("YYYY-MM-DD");
    if (workouts[formattedDate]) {
      setSelectedDay({
        date: formattedDate,
        workouts: workouts[formattedDate],
      });
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.navButton}>Préc.</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{currentMonth.format("MMMM YYYY")}</Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.navButton}>Suiv.</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View style={styles.calendar}>
        {daysInMonth.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dayBox}
            onPress={() => openDayDetails(day)}
          >
            <Text style={styles.dayText}>{day.format("D")}</Text>
            {workouts[day.format("YYYY-MM-DD")] && (
              <View style={styles.eventDot} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal pour afficher les détails d'une journée */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Fermer</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {moment(selectedDay?.date).format("D MMMM YYYY")}
            </Text>
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedDay?.workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
  },
  navButton: {
    fontSize: 16,
    color: "#0056D2",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayBox: {
    width: "13%",
    alignItems: "center",
    marginBottom: 15,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E283C",
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0056D2",
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: {
    fontSize: 16,
    color: "#0056D2",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
});

export default MonthlyCalendarScreen;
