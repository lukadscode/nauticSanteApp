import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";
import { useNavigation } from "@react-navigation/native";
import moment, { now } from "moment";
import ModalAddToCalendar from "../themes/ModalAddToCalendar";

const ActivityListScreen = () => {
  const [search, setSearch] = useState("");
  const [sportsActivities, setSportsActivities] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState();
  const [filteredActivities, setFilteredActivities] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    fetchSportsActivities();
  }, []);

  const fetchSportsActivities = async () => {
    const results = (
      await API.get(
        "/exercises?filters[tags][name][$eq]=Activité&pagination[limit]=100"
      )
    ).data?.data;

    const sortedResults = results.sort((a, b) => a.name.localeCompare(b.name));

    setSportsActivities(sortedResults);
    setFilteredActivities(sortedResults);
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = sportsActivities.filter((activity) =>
      activity.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredActivities(filtered);
  };

  const handleCreateActivity = (exerciseDocumentId, exerciseName) => {
    const calendarEl = {
      exerciseDocumentId,
      date: moment(now()).toISOString(),
      session: { name: exerciseName },
    };

    navigation.navigate("RecordResultScreen", { calendarEl });
  };

  const handleAddToCalendar = (activity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const backToHome = () => {
    navigation.navigate("Main");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activités Sportives</Text>
        <View style={{ width: 24 }} />
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="🔍 Rechercher une activité..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredActivities}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.activityText}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleAddToCalendar(item)}
              >
                <Ionicons name="calendar-outline" size={20} color="#2167b1" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleCreateActivity(item.documentId, item.name)}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color="#2167b1"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <ModalAddToCalendar
        session={null}
        activity={selectedActivity}
        setModalVisible={setModalVisible}
        modalVisible={isModalVisible}
        setCalendarEl={backToHome}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2167b1",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  searchBar: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  activityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    backgroundColor: "#e6f0fa",
    borderRadius: 20,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ActivityListScreen;
