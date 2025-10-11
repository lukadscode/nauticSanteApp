import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import moment from "moment";
import "moment/locale/fr";

// Importez vos pages pour navigation
import WorkoutListScreeen from "./PlanTrainingPages/WorkoutListScreen";
import WeeklyCalendarScreen from "./PlanTrainingPages/WeeklyCalendarScreen";
import MonthlyCalendarScreen from "./PlanTrainingPages/MonthlyCalendarScreen";

// Import du fichier JSON local
import workoutsData from "../api/workout.json"; // Vérifiez ce chemin !

moment.locale("fr");

const ApiExampleScreen = ({ navigation }) => {
  const [workouts, setWorkouts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulez un délai pour charger les données
    setTimeout(() => {
      const formattedWorkouts = formatWorkouts(workoutsData); // Utilisez workoutsData ici
      setWorkouts(formattedWorkouts);
      setLoading(false);
    }, 1000); // Simule un délai d'une seconde
  }, []);

  const formatWorkouts = (data) => {
    const formatted = {};
    data.forEach((workout) => {
      const date = moment(workout.date).format("YYYY-MM-DD");
      if (!formatted[date]) {
        formatted[date] = [];
      }
      formatted[date].push(workout);
    });
    return formatted;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0056D2" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez une vue</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("WorkoutListScreen", { workouts })}
      >
        <Text style={styles.buttonText}>Liste des entraînements</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("WeeklyCalendarScreen", { workouts })
        }
      >
        <Text style={styles.buttonText}>Calendrier Hebdomadaire</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("MonthlyCalendarScreen", { workouts })
        }
      >
        <Text style={styles.buttonText}>Calendrier Mensuel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E283C",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#0056D2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#8D95A7",
    marginTop: 10,
  },
});

export default ApiExampleScreen;
