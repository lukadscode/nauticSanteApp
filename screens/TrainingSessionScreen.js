import React, {useState} from "react";
import {ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import CustomButton from "../themes/ButtonBlue";
import {convertMettersToHumanDistance, convertSecToHumanTiming, extractAllToolsFromSession,} from "../services/utils";
import ModalAddToCalendar from "../themes/ModalAddToCalendar";
import {EXPO_PUBLIC_ASSETS_URL} from "../services/env";

const SerieDetailedCard = ({serie}) => {
  const getDuration = (serie) => {
    let duration = 0;
    serie.exercise_configurations.forEach((conf) => {
      if (conf.duration) duration += conf.duration;
    });
    return convertSecToHumanTiming(duration);
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardTitle}>{serie.name}</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricBoxEnhanced}>
          <Ionicons name="time-outline" size={20} color="#fff"/>
          <Text style={styles.metricTextEnhanced}>{getDuration(serie)}</Text>
        </View>
        <View style={styles.metricBoxEnhanced}>
          <Ionicons name="repeat-outline" size={20} color="#fff"/>
          <Text style={styles.metricTextEnhanced}>{serie.repetitions}x</Text>
        </View>
      </View>
      {serie.exercise_configurations.map((conf, idx) => (
        <View key={idx} style={styles.exerciseRow}>
          <Text style={conf.exercise.name === "Récupération passive" ? styles.exerciseName2 : styles.exerciseName}>{conf.exercise.name}</Text>
          <Text style={styles.exerciseDetails}>
            {conf.duration && `${convertSecToHumanTiming(conf.duration)} `}
            {conf.repetitions && `${conf.repetitions} reps `}
            {conf.cadence && `Cad : ${conf.cadence} `}
            {conf.distance && `${convertMettersToHumanDistance(conf.distance)}`}
          </Text>
        </View>
      ))}
    </View>
  );
};

const TipCard = ({description}) => {
  if (!description) return null;
  return (
    <View style={styles.tipCard}>
      <Ionicons name="bulb-outline" size={24} color="#ff9104"/>
      <Text style={styles.tipText}>{description}</Text>
    </View>
  );
};

const RecoveryBlock = ({time}) => (
  <View style={styles.recoveryBlock}>
    <Ionicons name="bed-outline" size={24} color="#1E283C"/>
    <Text style={styles.recoveryText}>{convertSecToHumanTiming(time)}</Text>
    <Text style={styles.recoveryLabel}>Récupération</Text>
  </View>
);

const TrainingSessionScreen = ({route}) => {
  const {session, calendarEl} = route.params;
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [myCalendarEl, setCalendarEl] = useState(calendarEl);
  const canAddToCalendar = !myCalendarEl || myCalendarEl.state === "finished";

  const handleNavigateToRecordResult = () => {
    navigation.navigate("RecordResultScreen", {calendarEl: myCalendarEl});
  };

  const handleAddToCalendar = () => setModalVisible(true);
  const handleOpenTutorial = () =>
    navigation.navigate("TrainingTutorialScreen", {session});
  const handleOpenSession = () =>
    navigation.navigate("TrainingSessionPlayerScreen", {session});

  const tools = extractAllToolsFromSession(session);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{
          uri:
            EXPO_PUBLIC_ASSETS_URL + (session.media?.formats?.medium?.url ??
              "/uploads/rameur_sport_equipement_fr_5d45d0da25.jpg"),
        }}
        style={styles.headerImage}
        imageStyle={{borderBottomLeftRadius: 20, borderBottomRightRadius: 20}}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.sessionTitle}>{session.name}</Text>
            <View style={styles.iconRow}>
              {canAddToCalendar && (
                <TouchableOpacity onPress={handleAddToCalendar}>
                  <Ionicons name="calendar-outline" size={24} color="#fff"/>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleOpenTutorial}>
                <Ionicons name="play-outline" size={24} color="#fff"/>
              </TouchableOpacity>
              {myCalendarEl?.state === "planned" && (
                <TouchableOpacity onPress={handleOpenSession}>
                  <Ionicons name="play" size={24} color="#fff"/>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{paddingBottom: 30}}
      >
        <TipCard description={session.description}/>

        {tools.length > 0 && (
          <View style={styles.toolList}>
            <Text style={styles.toolTitle}>Équipements :</Text>
            <View style={styles.badgeContainer}>
              {tools.map((tool, i) => (
                <View key={i} style={styles.badge}>
                  <Ionicons name="fitness-outline" size={14} color="#2167b1" />
                  <Text style={styles.badgeText}>{tool.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {session.series.map((serie, index) => (
          <React.Fragment key={serie.id}>
            <SerieDetailedCard serie={serie}/>
            {serie.finalRecuperation > 0 && (
              <RecoveryBlock time={serie.finalRecuperation}/>
            )}
          </React.Fragment>
        ))}

        {myCalendarEl?.state === "planned" && (
          <View style={{marginTop: 20}}>
            <CustomButton
              title="Enregistrer un résultat"
              onPress={handleNavigateToRecordResult}
            />
          </View>
        )}
      </ScrollView>

      <ModalAddToCalendar
        session={session}
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        setCalendarEl={setCalendarEl}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: "#fbfcff"},
  headerImage: {height: 220, width: "100%"},
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  iconRow: {
    flexDirection: "row",
    gap: 16,
  },
  scrollView: {
    padding: 20,
  },
  tipCard: {
    backgroundColor: "#FFF4E5",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  tipText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#8D5D00",
    flex: 1,
  },
  toolList: {marginBottom: 20},
  toolTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 8,
  },
  toolTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 6,
  },
  toolText: {marginLeft: 8, fontSize: 14, color: "#1E283C"},
  cardContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1E283C",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  metricBoxEnhanced: {
    flex: 1,
    backgroundColor: "#2167b1",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  metricTextEnhanced: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  exerciseName: {fontSize: 14, color: "#1E283C"},
  exerciseName2: {fontSize: 14, color: "#9E9E9E"},
  exerciseDetails: {fontSize: 14, fontWeight: "500", color: "#8D95A7"},
  recoveryBlock: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: -10,
  },
  recoveryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    marginTop: 5,
  },
  recoveryLabel: {
    fontSize: 14,
    color: "#8D95A7",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 8,
    borderRadius: 20,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#2167b1",
    fontWeight: "500",
  },
});

export default TrainingSessionScreen;
