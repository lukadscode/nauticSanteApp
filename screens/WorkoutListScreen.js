import React, {useEffect, useState} from "react";
import {ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import API from "../services/api";
import {useNavigation} from "@react-navigation/native";

const WorkoutListScreen = () => {
  const [activities, setActivities] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [activeTab, setActiveTab] = useState("activity");
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    fetchDatas();
  }, []);

  const fetchDatas = async () => {
    setLoading(true);
    try {
      const activitiesResponse = await API.get("/tags?filters[type][$eq]=activity&populate=sessions");
      const objectivesResponse = await API.get("/tags?filters[type][$eq]=objective&populate=sessions");

      setActivities(activitiesResponse?.data?.data || []);
      setObjectives(objectivesResponse?.data?.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
      setActivities([]);
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {name: "activity", label: "Par activité"},
    {name: "objective", label: "Par objectif"},
  ];

  const activitiesSessionsMap = {};
  activities.forEach(activity => {
    if (activity && activity.sessions && Array.isArray(activity.sessions)) {
      const sessionIds = activity.sessions.map(session => session?.id).filter(Boolean);
      activitiesSessionsMap[activity.id] = sessionIds;
    } else {
      activitiesSessionsMap[activity.id] = [];
    }
  });

  const objectivesSessionsMap = {};
  objectives.forEach(objective => {
    if (objective && objective.sessions && Array.isArray(objective.sessions)) {
      const sessionIds = objective.sessions.map(session => session?.id).filter(Boolean);
      objectivesSessionsMap[objective.id] = sessionIds;
    } else {
      objectivesSessionsMap[objective.id] = [];
    }
  });

  let activityGroups = activities.map(activity => {
    const activitySessionIds = new Set(activitiesSessionsMap[activity.id] || []);

    const matchingObjectives = objectives.filter(objective => {
      const objectiveSessionIds = objectivesSessionsMap[objective.id] || [];
      return objectiveSessionIds.some(sessionId => activitySessionIds.has(sessionId));
    });

    return {
      activity,
      objectives: matchingObjectives
    };
  });

  activityGroups = activityGroups.filter(activityG => activityG.objectives.length > 0);

  let objectiveGroups = objectives.map(objective => {
    const objectiveSessionIds = new Set(objectivesSessionsMap[objective.id] || []);

    const matchingActivities = activities.filter(activity => {
      const activitySessionIds = activitiesSessionsMap[activity.id] || [];
      return activitySessionIds.some(sessionId => objectiveSessionIds.has(sessionId));
    });

    return {
      objective,
      activities: matchingActivities
    };
  });

  objectiveGroups = objectiveGroups.filter(objG => objG.activities.length > 0);

  const renderActivityBlock = () => (
    <ScrollView contentContainerStyle={{paddingVertical: 20}}>
      {activityGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#E0E6F0" />
          <Text style={styles.emptyText}>Aucune activité disponible</Text>
          <Text style={styles.emptySubtext}>Les séances seront bientôt disponibles</Text>
        </View>
      ) : (
        activityGroups.map((activityG) => (
          <View key={activityG.activity.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{activityG.activity.name}</Text>

            <FlatList
              horizontal
              data={activityG.objectives}
              keyExtractor={(el) => el.id?.toString() || Math.random().toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: 20}}
              ItemSeparatorComponent={() => <View style={{width: 12}}/>}
              renderItem={({item: objective, index}) => {
                const bgColors = ["#E9F3FF", "#DDF8EC", "#FFF4D6", "#FEE6E7"];
                const randomColor = bgColors[index % bgColors.length];

                return (
                  <TouchableOpacity
                    style={[styles.simpleCard, {backgroundColor: randomColor}]}
                    onPress={() =>
                      navigation.navigate("WorkoutCategoryScreen", {
                        tagName: activityG.activity.name,
                        subTagName: objective.name,
                        tagIds: [activityG.activity.documentId, objective.documentId],
                      })
                    }
                  >
                    <Text style={styles.cardTitle}>{objective.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderObjectiveBlock = () => (
    <ScrollView contentContainerStyle={{paddingVertical: 20}}>
      {objectiveGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#E0E6F0" />
          <Text style={styles.emptyText}>Aucun objectif disponible</Text>
          <Text style={styles.emptySubtext}>Les séances seront bientôt disponibles</Text>
        </View>
      ) : (
        objectiveGroups.map((objectiveG) => (
          <View key={objectiveG.objective.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{objectiveG.objective.name}</Text>

            <FlatList
              horizontal
              data={objectiveG.activities}
              keyExtractor={(el) => el.id?.toString() || Math.random().toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: 20}}
              ItemSeparatorComponent={() => <View style={{width: 12}}/>}
              renderItem={({item: activity, index}) => {
                const bgColors = ["#E9F3FF", "#DDF8EC", "#FFF4D6", "#FEE6E7"];
                const randomColor = bgColors[index % bgColors.length];

                return (
                  <TouchableOpacity
                    style={[
                      styles.simpleCard,
                      {backgroundColor: randomColor},
                    ]}
                    onPress={() =>
                      navigation.navigate("WorkoutCategoryScreen", {
                        tagName: objectiveG.objective.name,
                        subTagName: activity.name,
                        tagIds: [activity.documentId, objectiveG.objective.documentId],
                      })
                    }
                  >
                    <Text style={styles.cardTitle}>{activity.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2167b1" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      );
    }

    if (activeTab === "objective") {
      return renderObjectiveBlock();
    }

    return renderActivityBlock();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Séances</Text>
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

      <View style={styles.contentWrapper}>{renderTabContent()}</View>
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
    shadowOffset: {width: 0, height: 4},
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
    backgroundColor: "#EDEFF3",
    borderRadius: 25,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  contentWrapper: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  simpleCard: {
    width: 140,
    height: 80,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E283C",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8D95A7",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8D95A7",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#B0B9C8",
    marginTop: 8,
  },
});

export default WorkoutListScreen;
