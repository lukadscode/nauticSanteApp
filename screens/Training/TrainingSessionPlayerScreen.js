// TrainingSessionPlayerScreen.js
import React, {useEffect, useRef, useState} from "react";
import {Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Sound} from "expo-audio";
import {useNavigation} from "@react-navigation/native";
import {EXPO_PUBLIC_ASSETS_URL} from "../../services/env";
import moment from "moment";

const TrainingSessionPlayerScreen = ({route}) => {
  const session = route.params?.session;
  const navigation = useNavigation();

  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = écran de démarrage
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  const allExercises = session.series.flatMap((serie) =>
    Array(serie.repetitions).fill(serie.exercise_configurations).flat()
  );

  const currentExerciseConf = allExercises[currentIndex];

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentIndex >= 0 && !isPaused) {
      playSound();
      handleNextExercise();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, isPaused]);

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < allExercises.length) {
      setTimeLeft(allExercises[currentIndex].duration || 30);
    }
  }, [currentIndex]);

  const handleNextExercise = () => {
    clearTimeout(timerRef.current);
    if (currentIndex < allExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleStart = () => {
    setCurrentIndex(0);
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const playSound = async () => {
    try {
      const sound = new Sound();

      await sound.loadAsync({
        uri: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
      });

      await sound.playAsync();

      // Optionnel : décharge le son une fois terminé
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.warn("Erreur lecture audio :", err);
    }
  };

  if (isFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>🎉 Bravo !</Text>
          <Text style={styles.endMessage}>
            Tu as terminé ta séance avec succès. Ton corps te dit merci !
          </Text>
          <Image
            source={{
              uri: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
            }}
            style={styles.endImage}
          />
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={() => {
              const now = moment();
              const start = moment(
                session.startTime || session.createdAt || new Date()
              );
              const realDuration = moment.duration(now.diff(start)).asSeconds();

              navigation.navigate("RecordResultScreen", {
                calendarEl: {
                  ...session,
                  date: now.toISOString(),
                  duration: realDuration,
                },
              });
            }}
          >
            <Text style={styles.startWorkoutText}>Enregistrer le résultat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex === -1) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.startContainer}>
          <Text style={styles.exerciseTitle}>{session.name}</Text>
          <Text style={styles.startMessage}>
            Avant de commencer, assure-toi d’être bien échauffé, en forme et
            d’avoir le matériel nécessaire.
          </Text>

          <View style={styles.equipmentContainer}>
            {Array.from(
              new Set(
                allExercises.flatMap(
                  (exConf) => exConf.exercise.tools.map((e) => e.name) || []
                )
              )
            ).map((name, index) => (
              <View key={index} style={styles.equipmentTag}>
                <Ionicons name="fitness-outline" size={16} color="#1E283C"/>
                <Text style={styles.equipmentText}>{name}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleStart}>
            <Text style={styles.nextButtonText}>Commencer la séance</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF"/>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri:
            EXPO_PUBLIC_ASSETS_URL + (currentExerciseConf.exercise.medias?.length > 0 && currentExerciseConf.exercise.medias[0]?.formats?.medium?.url ?
              currentExerciseConf.exercise.medias[0].formats.medium.url :
              "/uploads/rameur_sport_equipement_fr_5d45d0da25.jpg"),
        }}
        style={styles.headerImage}
        resizeMode="contain"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.exerciseTitle}>
          {currentExerciseConf.exercise.name}
        </Text>

        <Text style={styles.timer}>
          {Math.floor(timeLeft / 60)
            .toString()
            .padStart(2, "0")}
          :{(timeLeft % 60).toString().padStart(2, "0")}
        </Text>

        <View style={styles.tipCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          {currentExerciseConf.exercise.description ? (
            <Text style={styles.tipText}>
              {currentExerciseConf.exercise.description}
            </Text>
          ) : (
            <Text style={styles.tipText}>Aucun conseil spécifique.</Text>
          )}
        </View>

        {currentExerciseConf.exercise.muscles.length > 0 && (
          <Text style={styles.sectionTitle}>Muscles sollicités</Text>
        )}

        {currentExerciseConf.exercise.muscles.map((muscle) => {
          <Text style={styles.tipText}>{muscle.name}</Text>;
        })}
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNextExercise}
        >
          <Text style={styles.nextButtonText}>Suivant</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF"/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFCFF",
  },
  headerImage: {
    width: "100%",
    minHeight: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  startContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  startMessage: {
    fontSize: 16,
    color: "#1E283C",
    textAlign: "center",
    marginVertical: 20,
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E283C",
  },
  timer: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2167b1",
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: "#EAF3FF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E283C",
    alignSelf: "flex-start",
  },
  tipText: {
    fontSize: 14,
    color: "#1E283C",
    marginBottom: 5,
  },
  muscleImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  equipmentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  equipmentTag: {
    backgroundColor: "#ffedcc",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
  },
  equipmentText: {
    fontSize: 14,
    color: "#1E283C",
    marginLeft: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  pauseButton: {
    backgroundColor: "#FFA726",
    padding: 15,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
    flexDirection: "row",
    backgroundColor: "#2167b1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 10,
  },
  endContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  endTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E283C",
    marginBottom: 10,
  },
  endMessage: {
    fontSize: 16,
    color: "#1E283C",
    marginBottom: 20,
    textAlign: "center",
  },
  endImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  startWorkoutButton: {
    backgroundColor: "#2167b1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "70%",
  },
  startWorkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TrainingSessionPlayerScreen;
