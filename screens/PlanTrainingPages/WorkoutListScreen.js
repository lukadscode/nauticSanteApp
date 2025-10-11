import React, {useContext, useEffect, useState} from "react";
import {RefreshControl, ScrollView, StyleSheet, Text, View,} from "react-native";
import moment from "moment";
import "moment/locale/fr";
import SessionLightCard from "../../themes/SessionLightCard";
import API from "../../services/api";
import {AuthContext} from "../../context/AuthContext";
import ExerciseLightCard from "../../themes/ExerciseLightCard";
import FormLightCard from "../../themes/FormLightCard";

moment.locale("fr");

const WorkoutListScreen = () => {
  const [indexedSessionCalendarElements, setIndexedSessionCalendarElements] =
    useState({});
  const [isRefreshing, setRefreshing] = useState(false);
  const appContext = useContext(AuthContext);

  useEffect(() => {
    loadCalendarElements(moment());
  }, []);

  useEffect(() => {
    loadCalendarElements(moment());
  }, [appContext.refreshTraining])

  const loadCalendarElements = async (startingDate) => {
    setRefreshing(true);
    try {
      const response = await API.get(
        `/calendar-element/findMyElements?dateMin=${startingDate.format(
          "YYYY-MM-DD"
        )}`
      );
      const calendarElements = response.data?.results || [];

      const sessionCalEl = {};
      calendarElements
        .filter((calEl) => calEl.session || (calEl.form && moment(calEl.date) > moment()) || calEl.exercise)
        .forEach((calEl) => {
          const dateKey = moment(calEl.date).format("YYYY-MM-DD");
          if (!sessionCalEl[dateKey]) {
            sessionCalEl[dateKey] = [];
          }
          sessionCalEl[dateKey].push(calEl);
        });

      setIndexedSessionCalendarElements(sessionCalEl);
    } catch (error) {
      console.error("Erreur lors du chargement des entraînements :", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadCalendarElements(moment())}
        />
      }
      style={styles.container}
    >
      {isRefreshing && <Text style={styles.loadingText}>Chargement...</Text>}

      {!isRefreshing &&
        Object.keys(indexedSessionCalendarElements).length === 0 && (
          <Text style={styles.noWorkoutText}>
            Aucun entraînement à venir...
          </Text>
        )}

      <View>
        {Object.keys(indexedSessionCalendarElements).map((calElDate) => (
          <View style={styles.dayBlock} key={calElDate}>
            {/* Affiche la date formatée */}
            <Text style={styles.dayText}>
              {moment(calElDate).format("dddd D MMMM")}
            </Text>

            {/* Affiche les entraînements du jour */}
            {indexedSessionCalendarElements[calElDate].map((calEl, index) => (
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
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    padding: 20,
  },
  dayBlock: {
    marginBottom: 20,
  },
  dayText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 10,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#1E283C",
    marginTop: 20,
  },
  noWorkoutText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#8D95A7",
    marginTop: 20,
  },
});

export default WorkoutListScreen;
