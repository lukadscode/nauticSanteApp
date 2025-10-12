import React, {useEffect, useRef, useState} from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Animated,
  Vibration,
  BackHandler,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Audio} from "expo-av";
import {useNavigation} from "@react-navigation/native";
import {EXPO_PUBLIC_ASSETS_URL} from "../../services/env";
import OptimizedImage from "../../components/OptimizedImage";
import moment from "moment";
import Svg, {Circle} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TrainingSessionPlayerScreen = ({route}) => {
  const session = route.params?.session;
  const navigation = useNavigation();

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);
  const soundRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const allExercises = session.series.flatMap((serie) =>
    Array(serie.repetitions).fill(serie.exercise_configurations).flat()
  );

  const currentExerciseConf = allExercises[currentIndex];

  useEffect(() => {
    loadSound();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPaused && timeLeft > 0 && currentIndex >= 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentIndex >= 0 && !isPaused) {
      handleExerciseComplete();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isPaused, currentIndex]);

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < allExercises.length) {
      const duration = allExercises[currentIndex].duration || 30;
      setTimeLeft(duration);
      setInitialTime(duration);
      progressAnim.setValue(0);

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [currentIndex]);

  const loadSound = async () => {
    try {
      const {sound} = await Audio.Sound.createAsync(
        require("../../assets/sounds/android_beep.mp3")
      );
      soundRef.current = sound;
    } catch (error) {
      console.warn("Erreur chargement du son:", error);
    }
  };

  const playSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.warn("Erreur lecture audio:", error);
    }
  };

  const handleExerciseComplete = async () => {
    await playSound();
    Vibration.vibrate([0, 200, 100, 200]);
    handleNextExercise();
  };

  const handleNextExercise = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (currentIndex < allExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPaused(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleStart = () => {
    setCurrentIndex(0);
    setStartTime(moment());
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleSkip = () => {
    Alert.alert(
      "Passer l'exercice",
      "Voulez-vous passer cet exercice ?",
      [
        {text: "Annuler", style: "cancel"},
        {text: "Passer", onPress: handleNextExercise},
      ]
    );
  };

  const handleAddTime = (seconds) => {
    setTimeLeft((prev) => prev + seconds);
    setInitialTime((prev) => prev + seconds);
  };

  const handleBackPress = () => {
    if (currentIndex >= 0 && !isFinished) {
      Alert.alert(
        "Quitter l'entraînement",
        "Êtes-vous sûr de vouloir quitter ? Votre progression sera perdue.",
        [
          {text: "Annuler", style: "cancel"},
          {text: "Quitter", onPress: () => navigation.goBack(), style: "destructive"},
        ]
      );
      return true;
    }
    return false;
  };

  if (isFinished) {
    const now = moment();
    const realDuration = startTime ? moment.duration(now.diff(startTime)).asSeconds() : 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>🎉 Bravo !</Text>
          <Text style={styles.endMessage}>
            Tu as terminé ta séance avec succès. Ton corps te dit merci !
          </Text>
          <Text style={styles.statsText}>
            Temps total : {Math.floor(realDuration / 60)} min {Math.floor(realDuration % 60)} sec
          </Text>
          <Text style={styles.statsText}>
            Exercices complétés : {allExercises.length}
          </Text>
          <OptimizedImage
            source={{
              uri:
                EXPO_PUBLIC_ASSETS_URL +
                (session.media?.formats?.medium?.url ??
                  "/uploads/rameur_sport_equipement_fr_5d45d0da25.jpg"),
            }}
            style={styles.endImage}
            contentFit="cover"
            fallbackIcon="trophy-outline"
            fallbackIconSize={64}
          />
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={() => {
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
          <TouchableOpacity
            style={[styles.startWorkoutButton, {marginTop: 10, backgroundColor: "#ccc"}]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.startWorkoutText, {color: "#1E283C"}]}>
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex === -1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1E283C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Préparation</Text>
          <View style={{width: 40}} />
        </View>
        <ScrollView contentContainerStyle={styles.startContainer}>
          <Text style={styles.exerciseTitle}>{session.name}</Text>
          <Text style={styles.startMessage}>
            Avant de commencer, assure-toi d'être bien échauffé, en forme et
            d'avoir le matériel nécessaire.
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={24} color="#2167b1" />
              <Text style={styles.statLabel}>Exercices</Text>
              <Text style={styles.statValue}>{allExercises.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color="#2167b1" />
              <Text style={styles.statLabel}>Durée estimée</Text>
              <Text style={styles.statValue}>
                {Math.floor(
                  allExercises.reduce((acc, ex) => acc + (ex.duration || 30), 0) / 60
                )} min
              </Text>
            </View>
          </View>

          {Array.from(
            new Set(
              allExercises.flatMap(
                (exConf) => exConf.exercise.tools?.map((e) => e.name) || []
              )
            )
          ).length > 0 && (
            <>
              <Text style={styles.equipmentTitle}>Équipement nécessaire :</Text>
              <View style={styles.equipmentContainer}>
                {Array.from(
                  new Set(
                    allExercises.flatMap(
                      (exConf) => exConf.exercise.tools?.map((e) => e.name) || []
                    )
                  )
                ).map((name, index) => (
                  <View key={index} style={styles.equipmentTag}>
                    <Ionicons name="fitness-outline" size={16} color="#1E283C"/>
                    <Text style={styles.equipmentText}>{name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleStart}>
            <Text style={styles.nextButtonText}>Commencer la séance</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF"/>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const circumference = 2 * Math.PI * 70;
  const progress = timeLeft / initialTime;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="close" size={24} color="#1E283C" />
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {allExercises.length}
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {width: `${((currentIndex + 1) / allExercises.length) * 100}%`},
              ]}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Ionicons name="play-skip-forward" size={24} color="#1E283C" />
        </TouchableOpacity>
      </View>

      <OptimizedImage
        source={{
          uri:
            EXPO_PUBLIC_ASSETS_URL +
            (currentExerciseConf.exercise.medias?.length > 0 &&
            currentExerciseConf.exercise.medias[0]?.formats?.medium?.url
              ? currentExerciseConf.exercise.medias[0].formats.medium.url
              : "/uploads/rameur_sport_equipement_fr_5d45d0da25.jpg"),
        }}
        style={styles.headerImage}
        contentFit="contain"
        fallbackIcon="barbell-outline"
        fallbackIconSize={64}
        priority="high"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.exerciseTitle}>
          {currentExerciseConf.exercise.name}
        </Text>

        <View style={styles.timerContainer}>
          <Svg width="160" height="160" style={styles.timerSvg}>
            <Circle
              cx="80"
              cy="80"
              r="70"
              stroke="#E0E6F0"
              strokeWidth="10"
              fill="none"
            />
            <AnimatedCircle
              cx="80"
              cy="80"
              r="70"
              stroke="#2167b1"
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              rotation="-90"
              origin="80, 80"
            />
          </Svg>
          <View style={styles.timerTextContainer}>
            <Text style={styles.timer}>
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(timeLeft % 60).toString().padStart(2, "0")}
            </Text>
          </View>
        </View>

        <View style={styles.timeAdjustButtons}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => handleAddTime(-30)}
          >
            <Text style={styles.timeButtonText}>-30s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => handleAddTime(30)}
          >
            <Text style={styles.timeButtonText}>+30s</Text>
          </TouchableOpacity>
        </View>

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

        {currentExerciseConf.exercise.muscles &&
          currentExerciseConf.exercise.muscles.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Muscles sollicités</Text>
              <View style={styles.musclesContainer}>
                {currentExerciseConf.exercise.muscles.map((muscle, index) => (
                  <View key={index} style={styles.muscleTag}>
                    <Ionicons name="body-outline" size={16} color="#2167b1" />
                    <Text style={styles.muscleText}>{muscle.name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.pauseButton, isPaused && styles.playButton]}
          onPress={handlePause}
        >
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNextExercise}>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E6F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
  },
  backButton: {
    padding: 5,
  },
  skipButton: {
    padding: 5,
  },
  progressInfo: {
    flex: 1,
    marginHorizontal: 15,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 5,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E0E6F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2167b1",
    borderRadius: 3,
  },
  headerImage: {
    width: "100%",
    height: 200,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  startContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  startMessage: {
    fontSize: 16,
    color: "#1E283C",
    textAlign: "center",
    marginVertical: 20,
    lineHeight: 24,
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1E283C",
    textAlign: "center",
  },
  timerContainer: {
    position: "relative",
    width: 160,
    height: 160,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  timerSvg: {
    position: "absolute",
  },
  timerTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#2167b1",
  },
  timeAdjustButtons: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  timeButton: {
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2167b1",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    gap: 40,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#8D95A7",
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  equipmentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 30,
    gap: 8,
  },
  equipmentTag: {
    backgroundColor: "#ffedcc",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  equipmentText: {
    fontSize: 14,
    color: "#1E283C",
    marginLeft: 5,
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
  },
  tipText: {
    fontSize: 14,
    color: "#1E283C",
    lineHeight: 20,
  },
  musclesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
    width: "100%",
  },
  muscleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  muscleText: {
    fontSize: 13,
    color: "#2167b1",
    marginLeft: 6,
    fontWeight: "500",
  },
  buttonRow: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pauseButton: {
    backgroundColor: "#FFA726",
    padding: 15,
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playButton: {
    backgroundColor: "#4CAF50",
  },
  nextButton: {
    flex: 1,
    marginLeft: 15,
    flexDirection: "row",
    backgroundColor: "#2167b1",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    marginBottom: 15,
    textAlign: "center",
  },
  statsText: {
    fontSize: 14,
    color: "#8D95A7",
    marginBottom: 5,
  },
  endImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  startWorkoutButton: {
    backgroundColor: "#2167b1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  startWorkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TrainingSessionPlayerScreen;
