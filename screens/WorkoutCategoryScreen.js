import React, {useEffect, useState} from "react";
import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import API from "../services/api";
import SessionCard from "../themes/SessionCard";

const WorkoutCategoryScreen = ({route, navigation}) => {
  const {tagName, subTagName, tagIds} = route.params;
  const [sessions, setSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions()
    setRefreshing(false);

  }
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await API.get(
        "/sessions/findAllPublic?tags=" + JSON.stringify(tagIds)
      );

      setSessions(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des séances :", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2167b1"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tagName} : {subTagName}
        </Text>
        <View style={{width: 24}}/>
      </View>

      {/* Liste des séances */}

      <ScrollView
        style={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
        }>
        {sessions?.length > 0 ? (
            sessions.map(session => <SessionCard session={session} key={session.documentId}/>)
          )
          : <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={40} color="#A9B6D1"/>
            <Text style={styles.emptyText}>
              Aucune séance disponible pour le moment.
            </Text>
          </View>}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
    backgroundColor: "#EAF3FF",
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#8D95A7",
    textAlign: "center",
  },
});

export default WorkoutCategoryScreen;
