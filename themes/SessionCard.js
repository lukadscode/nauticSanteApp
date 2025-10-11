import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  convertMettersToHumanDistance,
  convertSecToHumanTiming,
  extractAllToolsFromSession,
} from "../services/utils";
import { useNavigation } from "@react-navigation/native";
import {
  getSessionStateColor,
  translateSessionState,
} from "./SessionLightCard";

const SessionCard = ({ session, calendarEl }) => {
  const navigation = useNavigation();

  if (!session || session.series?.length === 0) return null;

  const handlePress = () => {
    navigation.navigate("TrainingSessionScreen", { session, calendarEl });
  };

  const tools = extractAllToolsFromSession(session);

  const getDuration = (serie) => {
    let duration = 0;
    serie.exercise_configurations.forEach((conf) => {
      if (conf.duration) duration += conf.duration;
    });
    return convertSecToHumanTiming(duration);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.cardWrapper}>
      <View style={styles.leftStripe} />

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>
            #{session.id} {session.name}
          </Text>
          {calendarEl && (
            <View
              style={[
                styles.badge,
                { backgroundColor: getSessionStateColor(calendarEl.state) },
              ]}
            >
              <Text style={styles.badgeText}>
                {translateSessionState(calendarEl.state)}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.equipment}>
          {tools.length > 0
            ? tools.map((t) => t.name).join(", ")
            : "Aucun équipement"}
        </Text>

        {session.series.map((serie, i) => (
          <View key={serie.id || i} style={styles.serieBlock}>
            <View style={styles.metricRow}>
              <Text style={styles.metric}>⏱ {getDuration(serie)}</Text>
              <Text style={styles.metric}>🔁 {serie.repetitions}x</Text>
            </View>

            {serie.exercise_configurations.map(
              (ex, j) =>
                ex.exercise.name !== "Récupération passive" && (
                  <View key={j} style={styles.exerciseRow}>
                    <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {ex.duration &&
                        `${convertSecToHumanTiming(ex.duration)} `}
                      {ex.repetitions && `${ex.repetitions} reps `}
                      {ex.cadence && `Cad : ${ex.cadence} `}
                      {ex.distance &&
                        convertMettersToHumanDistance(ex.distance)}
                    </Text>
                  </View>
                )
            )}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  leftStripe: {
    width: 6,
    backgroundColor: "#2167b1",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    flex: 1,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  equipment: {
    fontSize: 13,
    color: "#8D95A7",
    marginBottom: 10,
  },
  serieBlock: {
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#EAF3FF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  metric: {
    fontSize: 14,
    color: "#2167b1",
    fontWeight: "600",
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 14,
    color: "#1E283C",
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 13,
    color: "#8D95A7",
    textAlign: "right",
    flex: 1,
  },
});

export default SessionCard;
