import React, {useContext, useEffect, useState} from "react";
import {Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import AddMenuModal from "./AddMenuModal";
import API from "../services/api";
import moment, {now} from "moment";
import {
  convertSecToHumanTiming,
  getSessionDuration,
  getSessionStateColor,
  translateSessionState
} from "../services/utils";
import {useNavigation} from "@react-navigation/native";
import {AuthContext} from "../context/AuthContext";

const screenWidth = Dimensions.get("window").width;

const cardColors = [
  {backgroundColor: "#E1F5FE", textColor: "#01579B"},
  {backgroundColor: "#E8F5E9", textColor: "#2E7D32"},
  {backgroundColor: "#FFF3E0", textColor: "#EF6C00"},
  {backgroundColor: "#F3E5F5", textColor: "#6A1B9A"},
];

const TrainingProgress = ({}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [calendarElements, setCalendarElements] = useState([]);
  const navigation = useNavigation();
  const appContext = useContext(AuthContext);

  useEffect(() => {
    fetchCalendarEl();
  }, [appContext.refreshTraining]);

  const handleOpen = (item) => {
    if (item.session) {
      navigation.navigate("TrainingSessionScreen", {
        session: item.session,
        calendarEl: item,
      })
    } else if (item.form) {
      navigation.navigate("HealthQuestionDetailScreen", {questionSlug: item.form.slug});
    } else if (item.exercise) {
      if (item.exercise.videos.length > 0) {
        navigation.navigate("VideoExerciseScreen", {
          exercise: item.exercise
        });
      } else {
        //TODO ajout page détail exo
        //navigation.navigate("TrainingSessionScreen", {exercise: item.item, calendarEl});
      }
    }
  }

  const fetchCalendarEl = async () => {
    const dateMin = moment(now()).format("YYYY-MM-DD");
    const dateMax = moment(now()).add(1, "day").format("YYYY-MM-DD");

    const results =
      (
        await API.get(
          `/calendar-element/findMyElements?dateMin=${dateMin}&dateMax=${dateMax}`
        )
      ).data?.results ?? [];

    const sorted = results.sort((a, b) => {
      return a.state === "planned" ? -1 : b.state === "planned" ? 1 : 0;
    });

    setCalendarElements(sorted);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>💪 Entraînements du jour</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="add-circle" size={28} color="#1E283C"/>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <AddMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />

      {/* Cards */}
      <FlatList
        data={[...calendarElements, {isAddCard: true}]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => String(index)}
        contentContainerStyle={styles.trainingList}
        renderItem={({item, index}) => {
          if (item.isAddCard) {
            return (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={[styles.progressCard, styles.addCard]}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={32} color="#2167b1"/>
                <Text style={styles.addCardText}>Ajouter une activité</Text>
              </TouchableOpacity>
            );
          }

          const color = cardColors[index % cardColors.length];
          return (
            <TouchableOpacity
              onPress={() => handleOpen(item)}
              style={[
                styles.progressCard,
                {
                  backgroundColor: color.backgroundColor,
                  width: screenWidth * 0.75,
                },
              ]}
            >
              <View style={styles.badgeContainer}>
                {(item.session || item.exercise) &&
                  <Text
                    style={[
                      styles.statusBadge,
                      {backgroundColor: getSessionStateColor(item.state)},
                    ]}
                  >
                    {translateSessionState(item.state)}
                  </Text>
                }
              </View>
              <Text
                style={[styles.cardTitle, {color: color.textColor}]}
                numberOfLines={2}
              >
                {item.session?.name ?? item.exercise?.name ?? item.form?.title}
              </Text>
              <Text style={[styles.cardProgress, {color: color.textColor}]}>
                {item.progress}
              </Text>
              <Text style={[styles.cardDetails, {color: color.textColor}]}>
                {item.session && <>
                  {convertSecToHumanTiming(getSessionDuration(item.session))}
                </>
                }

              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
  },
  addButton: {
    marginRight: 10,
  },
  trainingList: {
    paddingLeft: 0,
    paddingRight: 20,
    marginBottom: 20,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginRight: 15,
    justifyContent: "center",
    overflow: "hidden",
  },
  badgeContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    flexShrink: 1,
  },
  cardProgress: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
  },
  cardDetails: {
    fontSize: 14,
  },
  addCard: {
    backgroundColor: "#f0f2f7",
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.75,
    borderRadius: 16,
  },
  addCardText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E283C",
  },
});

export default TrainingProgress;
