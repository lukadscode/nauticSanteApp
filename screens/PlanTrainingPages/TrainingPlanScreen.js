import React, {useCallback, useContext, useEffect, useState} from "react";
import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import moment from "moment";
import "moment/locale/fr";
import SessionLightCard from "../../themes/SessionLightCard"; // 👈 utilisé ici
import API from "../../services/api";
import {AuthContext} from "../../context/AuthContext";
import FormLightCard from "../../themes/FormLightCard";
import ExerciseLightCard from "../../themes/ExerciseLightCard";

moment.locale("FR");

const CalendarScreen = () => {
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("day"));
  const [selectedDate, setSelectedDate] = useState(moment().startOf("day"));
  const [calendarElements, setCalendarElements] = useState([]);
  const [isRefreshing, setRefreshing] = useState(false);
  const appContext = useContext(AuthContext)

  useEffect(() => {
    loadCalendarElements();
  }, [selectedDate, currentWeek, appContext.refreshTraining]);

  const getWeekDates = () => {
    const startOfWeek = currentWeek.clone().startOf("isoWeek");
    return Array.from({length: 7}, (_, i) =>
      startOfWeek.clone().add(i, "days")
    );
  };

  const goToPreviousWeek = () => {
    setCurrentWeek((prev) => prev.clone().subtract(1, "week"));
    setSelectedDate((prev) => prev.clone().subtract(1, "week"));
  };

  const goToNextWeek = () => {
    setCurrentWeek((prev) => prev.clone().add(1, "week"));
    setSelectedDate((prev) => prev.clone().add(1, "week"));
  };

  const goToToday = () => {
    const today = moment().startOf("day");
    setCurrentWeek(today);
    setSelectedDate(today);
  };

  const loadCalendarElements = async () => {
    try {
      const dateMin = selectedDate.format("YYYY-MM-DD");
      const dateMax = selectedDate.clone().add(1, "day").format("YYYY-MM-DD");

      const response = await API.get(
        `/calendar-element/findMyElements?dateMin=${dateMin}&dateMax=${dateMax}`
      );
      setCalendarElements(response.data?.results || []);
    } catch (error) {
      console.error("Erreur lors du chargement des entraînements :", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCalendarElements();
    }, [selectedDate, currentWeek])
  );

  return (
    <View style={styles.container}>
      {/* Navigation des jours */}
      <View style={styles.weekContainer}>
        <View style={styles.weekNavigator}>
          <TouchableOpacity onPress={goToPreviousWeek}>
            <Ionicons name="chevron-back" size={20} color="#1E283C"/>
          </TouchableOpacity>
          <Text style={styles.weekText}>
            {getWeekDates()[0].format("DD MMM")} –{" "}
            {getWeekDates()[6].format("DD MMM")}
          </Text>
          <TouchableOpacity onPress={goToNextWeek}>
            <Ionicons name="chevron-forward" size={20} color="#1E283C"/>
          </TouchableOpacity>
        </View>

        <View style={styles.weekBlock}>
          {getWeekDates().map((date) => (
            <TouchableOpacity
              key={date.format("YYYY-MM-DD")}
              style={[
                styles.dateBlock,
                date.isSame(selectedDate, "day") && styles.selectedDateBlock,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateText,
                  date.isSame(selectedDate, "day") && styles.selectedDateText,
                ]}
              >
                {date.format("ddd").toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  date.isSame(selectedDate, "day") && styles.selectedDateText,
                ]}
              >
                {date.format("DD")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayText}>AUJOURD'HUI</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des séances */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadCalendarElements}
          />
        }
        contentContainerStyle={styles.workoutList}
      >
        {calendarElements.length > 0 ? (
          calendarElements.map((calEl, index) => <View key={"calElSession" + index}
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
          )
        ) : (
          <Text style={styles.noWorkoutText}>
            Aucun entraînement pour ce jour-là
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  weekContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  weekNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
  },
  weekBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    width: 45,
    height: 60,
    borderRadius: 8,
  },
  selectedDateBlock: {
    backgroundColor: "#D7E7FF",
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8D95A7",
  },
  selectedDateText: {
    color: "#1E283C",
  },
  todayButton: {
    alignSelf: "flex-end",
    backgroundColor: "#2167b1",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 12,
  },
  todayText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  workoutList: {
    marginTop: 20,
    paddingBottom: 20,
  },
  noWorkoutText: {
    fontSize: 16,
    color: "#8D95A7",
    textAlign: "center",
    marginTop: 20,
  },
});

export default CalendarScreen;
