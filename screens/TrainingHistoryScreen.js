import React, { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import moment from "moment";
import { convertSecToHumanTiming } from "../services/utils";

const TrainingHistoryScreen = ({ navigation }) => {
  const appContext = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        "/calendar-element/findMyElements?state=finished&sort=date:desc"
      );
      setHistory(response.data.results || []);
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getMoodEmoji = (mood) => {
    const emojis = ["🙃", "😅", "🥵", "🤯"];
    return emojis[mood - 1] || "😐";
  };

  const groupByMonth = (workouts) => {
    const grouped = {};
    workouts.forEach((workout) => {
      const monthKey = moment(workout.date).format("MMMM YYYY");
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(workout);
    });
    return grouped;
  };

  const renderWorkoutCard = (workout) => {
    return (
      <TouchableOpacity
        key={workout.documentId}
        style={styles.workoutCard}
        onPress={() =>
          navigation.navigate("TrainingHistoryDetail", { workout })
        }
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutTitleContainer}>
            <Text style={styles.workoutName} numberOfLines={2}>
              {workout.session?.name || "Séance personnalisée"}
            </Text>
            <Text style={styles.workoutDate}>
              {moment(workout.date).format("DD MMMM YYYY")}
            </Text>
          </View>
          {workout.mood && (
            <Text style={styles.moodEmoji}>{getMoodEmoji(workout.mood)}</Text>
          )}
        </View>

        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#8D95A7" />
            <Text style={styles.statText}>
              {convertSecToHumanTiming(workout.realDuration || workout.duration)}
            </Text>
          </View>

          {workout.distance && (
            <View style={styles.statItem}>
              <Ionicons name="navigate-outline" size={16} color="#8D95A7" />
              <Text style={styles.statText}>{workout.distance} km</Text>
            </View>
          )}

          <View style={styles.statItem}>
            <Ionicons name="fitness-outline" size={16} color="#8D95A7" />
            <Text style={styles.statText}>
              {workout.session?.category || "Sport"}
            </Text>
          </View>
        </View>

        <View style={styles.workoutFooter}>
          <Ionicons name="chevron-forward" size={20} color="#2167b1" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2167b1" />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      );
    }

    if (history.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Aucun entraînement</Text>
          <Text style={styles.emptyText}>
            Vos entraînements terminés apparaîtront ici
          </Text>
        </View>
      );
    }

    const groupedHistory = groupByMonth(history);

    return (
      <View style={styles.historyContainer}>
        {Object.entries(groupedHistory).map(([month, workouts]) => (
          <View key={month} style={styles.monthSection}>
            <Text style={styles.monthTitle}>{month}</Text>
            <View style={styles.monthStats}>
              <Text style={styles.monthStatsText}>
                {workouts.length} séance{workouts.length > 1 ? "s" : ""}
              </Text>
            </View>
            {workouts.map((workout) => renderWorkoutCard(workout))}
          </View>
        ))}
      </View>
    );
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
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{history.length}</Text>
          <Text style={styles.statBoxLabel}>Séances</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {convertSecToHumanTiming(
              history.reduce((acc, w) => acc + (w.realDuration || w.duration || 0), 0)
            )}
          </Text>
          <Text style={styles.statBoxLabel}>Temps total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {history
              .reduce((acc, w) => acc + (parseFloat(w.distance) || 0), 0)
              .toFixed(1)}
          </Text>
          <Text style={styles.statBoxLabel}>km parcourus</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
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
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2167b1",
  },
  statBoxLabel: {
    fontSize: 12,
    color: "#8D95A7",
    marginTop: 4,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: "#8D95A7",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#8D95A7",
    marginTop: 8,
    textAlign: "center",
  },
  historyContainer: {
    gap: 25,
  },
  monthSection: {
    gap: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    textTransform: "capitalize",
  },
  monthStats: {
    marginBottom: 5,
  },
  monthStatsText: {
    fontSize: 13,
    color: "#8D95A7",
  },
  workoutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 13,
    color: "#8D95A7",
    textTransform: "capitalize",
  },
  moodEmoji: {
    fontSize: 28,
    marginLeft: 10,
  },
  workoutStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: "#8D95A7",
  },
  workoutFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    alignItems: "flex-end",
  },
});

export default TrainingHistoryScreen;
