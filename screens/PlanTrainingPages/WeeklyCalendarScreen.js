import React, {useCallback, useContext, useState} from "react";
import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/fr";
import {useFocusEffect} from "@react-navigation/native";
import SessionLightCard from "../../themes/SessionLightCard";
import API from "../../services/api";
import {AuthContext} from "../../context/AuthContext";
import ExerciseLightCard from "../../themes/ExerciseLightCard";
import FormLightCard from "../../themes/FormLightCard";

moment.locale("fr");

const WeeklyCalendarScreen = () => {
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("isoWeek"));
  const [groupedByDay, setGroupedByDay] = useState({});
  const [isRefreshing, setRefreshing] = useState(false);
  const appContext = useContext(AuthContext)

  const getWeekDates = () => {
    return Array.from({length: 7}, (_, i) =>
      currentWeek.clone().add(i, "days")
    );
  };

  const fetchCalendarElements = async () => {
    setRefreshing(true);
    try {
      const dateMin = currentWeek.clone().format("YYYY-MM-DD");
      const dateMax = currentWeek.clone().add(7, "days").format("YYYY-MM-DD");

      const response = await API.get(
        `/calendar-element/findMyElements?dateMin=${dateMin}&dateMax=${dateMax}`
      );
      const elements = response.data?.results || [];

      const grouped = {};
      elements.forEach((el) => {
        const dateKey = moment(el.date).format("YYYY-MM-DD");
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(el);
      });

      setGroupedByDay(grouped);
    } catch (error) {
      console.error("Erreur chargement calendrier:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCalendarElements();
    }, [currentWeek, appContext.refreshTraining])
  );

  const weekDays = getWeekDates();

  return (
    <View style={styles.container}>
      {/* Navigation Semaine */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            setCurrentWeek((prev) => prev.clone().subtract(1, "week"))
          }
        >
          <Ionicons name="chevron-back" size={24} color="#1E283C"/>
        </TouchableOpacity>
        <Text style={styles.weekRange}>
          {weekDays[0].format("DD MMM")} - {weekDays[6].format("DD MMM YYYY")}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentWeek((prev) => prev.clone().add(1, "week"))}
        >
          <Ionicons name="chevron-forward" size={24} color="#1E283C"/>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchCalendarElements}
          />
        }
      >
        {weekDays.map((day, index) => {
          const key = day.format("YYYY-MM-DD");
          const sessions = groupedByDay[key] || [];

          return (
            <View key={index} style={styles.dayBlock}>
              <Text style={styles.dayTitle}>
                {day.format("dddd")}{" "}
                <Text style={styles.dayDate}>{day.format("DD MMMM")}</Text>
              </Text>

              {sessions.length > 0 ? (
                sessions.map((calEl, index) => (
                  <View key={"calElSession" + index}
                  >
                    {calEl.session && <SessionLightCard
                      session={calEl.session}
                      calendarEl={calEl}
                      index={index}
                    />}
                    {calEl.exercise && <ExerciseLightCard
                      exercise={calEl.exercise}
                      calendarEl={calEl}
                      index={index}
                    />}
                    {calEl.form && <FormLightCard
                      form={calEl.form}
                      calendarEl={calEl}
                      index={index}
                    />}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucun entraînement prévu</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F9FF",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
  },
  weekRange: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
  },
  dayBlock: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#E0E6F0",
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 10,
  },
  dayDate: {
    fontWeight: "400",
    color: "#6B7A90",
  },
  emptyText: {
    fontSize: 14,
    color: "#B0B9C8",
    fontStyle: "italic",
  },
});

export default WeeklyCalendarScreen;
