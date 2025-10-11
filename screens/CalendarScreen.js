import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TrainingPlanScreen from "./PlanTrainingPages/TrainingPlanScreen";
import WeeklyCalendarScreen from "./PlanTrainingPages/WeeklyCalendarScreen";
import WorkoutListScreen from "./PlanTrainingPages/WorkoutListScreen";
import AddMenuModal from "../themes/AddMenuModal";

const CalendarScreen = () => {
  const [activeTab, setActiveTab] = useState("Jour"); // Onglet actif
  const [menuVisible, setMenuVisible] = useState(false);

  const tabs = [
    { name: "Jour", label: "JOUR", component: TrainingPlanScreen },
    { name: "Semaine", label: "SEMAINE", component: WeeklyCalendarScreen },
    { name: "Liste", label: "À FAIRE", component: WorkoutListScreen },
  ];

  const renderActiveComponent = () => {
    const ActiveComponent = tabs.find(
      (tab) => tab.name === activeTab
    )?.component;
    return ActiveComponent ? <ActiveComponent /> : null;
  };

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Mon Calendrier</Text>

        {/* Barre d'onglets */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tabButton,
                activeTab === tab.name && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab.name)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.name && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <AddMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />

      <View style={styles.content}>{renderActiveComponent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
  headerContainer: {
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E283C",
    textAlign: "center",
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EDEFF3",
    borderRadius: 25,
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: "#2167b1",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8D95A7",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  plusButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#1E283C",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 8,
  },
});

export default CalendarScreen;
