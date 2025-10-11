import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Pour les icônes
import {
  VictoryChart,
  VictoryLine,
  VictoryRadar,
  VictoryPolarAxis,
} from "victory-native";

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.switchButton}>
          <Ionicons name="water-outline" size={16} color="#FFFFFF" />
          <Text style={styles.switchText}>Swimming</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hello</Text>
          <Text style={styles.userName}>Luka!</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#1E283C" />
      </View>

      {/* Title */}
      <Text style={styles.title}>Are you all set for today’s trainings?</Text>

      {/* Training Progress */}
      <View style={styles.trainingProgress}>
        <View style={[styles.progressCard, { backgroundColor: "#1E283C" }]}>
          <Text style={styles.progressTitle}>SWIMMING</Text>
          <Text style={styles.progressPercentage}>30%</Text>
          <Text style={styles.progressSubtitle}>5 Rem.</Text>
        </View>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>DIVING</Text>
          <Text style={[styles.progressPercentage, { color: "#1E283C" }]}>
            30%
          </Text>
          <Text style={styles.progressSubtitle}>34 Mins</Text>
        </View>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>OTHER</Text>
          <Text style={[styles.progressPercentage, { color: "#1E283C" }]}>
            10%
          </Text>
          <Text style={styles.progressSubtitle}>12 Mins</Text>
        </View>
      </View>

      {/* Week Summary */}
      <Text style={styles.subtitle}>Week Summary</Text>
      <View style={styles.weekSummary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>TRAINING HOURS</Text>
          <Text style={styles.summaryValue}>06hrs 42mins</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#D7E7FF" }]}>
          <Text style={styles.summaryTitle}>CALORIES BURNED</Text>
          <Text style={styles.summaryValue}>1057</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View style={styles.barChart}>
        <Text style={styles.chartLabel}>Weekly Training Hours</Text>
        {/* Bar Chart Placeholder */}
        <View style={styles.barChartPlaceholder}>
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </View>
      </View>

      {/* Health Controls */}
      <Text style={styles.subtitle}>Health Controls</Text>
      <View style={styles.healthControls}>
        {/* Radar Chart Placeholder */}
        <VictoryChart polar>
          <VictoryPolarAxis />
          <VictoryRadar
            data={[
              { x: "Strength", y: 80 },
              { x: "Speed", y: 60 },
              { x: "Endurance", y: 75 },
              { x: "Recovery", y: 90 },
              { x: "Flexibility", y: 50 },
            ]}
            style={{
              data: { fill: "#4A90E2", fillOpacity: 0.5, strokeWidth: 2 },
            }}
          />
        </VictoryChart>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  switchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E283C",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  switchText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "600",
  },
  userInfo: {
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 16,
    color: "#8D95A7",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E283C",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 20,
  },
  trainingProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  progressCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
  },
  progressTitle: {
    fontSize: 14,
    color: "#8D95A7",
    marginBottom: 10,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progressSubtitle: {
    fontSize: 14,
    color: "#8D95A7",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 10,
  },
  weekSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    color: "#8D95A7",
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
  },
  barChart: {
    marginBottom: 20,
  },
  chartLabel: {
    fontSize: 14,
    color: "#8D95A7",
    marginBottom: 10,
  },
  barChartPlaceholder: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bar: {
    width: 10,
    height: 50,
    backgroundColor: "#1E283C",
    borderRadius: 5,
  },
  healthControls: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
});

export default HomeScreen;
