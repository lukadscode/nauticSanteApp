import React, { useState, useRef } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Platform,
  Alert,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ModalAddToCalendar from "../../themes/ModalAddToCalendar";
import { EXPO_PUBLIC_ASSETS_URL } from "../../services/env";
import OptimizedImage from "../../components/OptimizedImage";
import { Video } from "expo-av";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TrainingTutorialScreen = ({ route }) => {
  const session = route.params?.session;
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTutorialFinished, setIsTutorialFinished] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);

  const pan = useRef(new Animated.Value(0)).current;

  if (!session || !session.series) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Erreur : Aucune session trouvée.</Text>
      </SafeAreaView>
    );
  }

  const uniqueExercises = Array.from(
    new Map(
      session.series.flatMap((serie) =>
        serie.exercise_configurations.map((exerciseConf) => [
          exerciseConf.exercise.name,
          exerciseConf.exercise,
        ])
      )
    ).values()
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100 && currentIndex > 0) {
          handlePreviousExercise();
        } else if (gestureState.dx < -100 && understood) {
          handleNextExercise();
        }
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const handleNextExercise = () => {
    if (!understood) {
      Alert.alert("Attention", "Veuillez confirmer que vous avez compris avant de continuer.");
      return;
    }

    if (currentIndex < uniqueExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUnderstood(false);
      setShowVideo(false);
    } else {
      setIsTutorialFinished(true);
    }
  };

  const handlePreviousExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUnderstood(false);
      setShowVideo(false);
    }
  };

  const handleAddToCalendar = () => {
    setModalVisible(true);
  };

  const handleCalendarSet = () => {
    setModalVisible(false);
    if (Platform.OS === "android") {
      ToastAndroid.show("Séance programmée avec succès !", ToastAndroid.SHORT);
    } else {
      Alert.alert("Succès", "Séance programmée avec succès !");
    }
    navigation.goBack();
  };

  const handleVideoPress = () => {
    setShowVideo(!showVideo);
  };

  if (isTutorialFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>🎉 Félicitations ! 🎉</Text>
          <Text style={styles.endMessage}>
            Tu as terminé le tutoriel ! Maintenant, il est temps de passer à
            l'entraînement ! 💪🔥
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
            fallbackIcon="fitness-outline"
            fallbackIconSize={64}
          />
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={handleAddToCalendar}
          >
            <Text style={styles.startWorkoutText}>Programmer la séance 📅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.startWorkoutButton,
              { marginTop: 10, backgroundColor: "#ccc" },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.startWorkoutText, { color: "#1E283C" }]}>
              Faire plus tard
            </Text>
          </TouchableOpacity>
        </View>
        <ModalAddToCalendar
          session={session}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          setCalendarEl={handleCalendarSet}
        />
      </SafeAreaView>
    );
  }

  const currentExercise = uniqueExercises[currentIndex];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#1E283C" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {uniqueExercises.length}
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${((currentIndex + 1) / uniqueExercises.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <Animated.View
        style={{ flex: 1, transform: [{ translateX: pan }] }}
        {...panResponder.panHandlers}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {showVideo && currentExercise.video ? (
            <Video
              ref={videoRef}
              source={{ uri: currentExercise.video }}
              style={styles.headerImage}
              useNativeControls
              resizeMode="contain"
              shouldPlay
              isLooping
            />
          ) : (
            <OptimizedImage
              source={{
                uri:
                  EXPO_PUBLIC_ASSETS_URL +
                  (currentExercise.medias?.length > 0 &&
                  currentExercise.medias[0]?.formats?.medium?.url
                    ? currentExercise.medias[0].formats.medium.url
                    : "/uploads/rameur_sport_equipement_fr_5d45d0da25.jpg"),
              }}
              style={styles.headerImage}
              contentFit="contain"
              fallbackIcon="barbell-outline"
              fallbackIconSize={64}
              priority="high"
            />
          )}

          <View style={styles.content}>
            <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>

            {currentExercise.video && (
              <TouchableOpacity
                style={styles.videoButton}
                onPress={handleVideoPress}
              >
                <Ionicons
                  name={showVideo ? "image" : "play-circle"}
                  size={40}
                  color="#2167b1"
                />
                <Text style={styles.videoText}>
                  {showVideo ? "Voir l'image" : "Voir la vidéo"}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.tipCard}>
              <Text style={styles.sectionTitle}>Conseils</Text>
              {currentExercise.description &&
              currentExercise.description.length > 0 ? (
                <Text style={styles.tipText}>{currentExercise.description}</Text>
              ) : (
                <Text style={styles.tipText}>
                  - Gardez le dos droit - Respirez correctement - Échauffez-vous
                  avant l'exercice
                </Text>
              )}
            </View>

            {currentExercise.muscles && currentExercise.muscles.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Muscles sollicités</Text>
                <View style={styles.musclesContainer}>
                  {currentExercise.muscles.map((muscle, index) => (
                    <View key={index} style={styles.muscleTag}>
                      <Ionicons name="body-outline" size={16} color="#2167b1" />
                      <Text style={styles.muscleText}>{muscle.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {currentExercise.equipment && currentExercise.equipment.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Matériel nécessaire</Text>
                <View style={styles.equipmentContainer}>
                  {currentExercise.equipment.map((tool, index) => (
                    <View key={index} style={styles.equipmentTag}>
                      <Ionicons name="fitness-outline" size={18} color="#1E283C" />
                      <Text style={styles.equipmentText}>{tool.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.checklistButton,
                understood && styles.checklistButtonActive,
              ]}
              onPress={() => setUnderstood(!understood)}
            >
              <Ionicons
                name={understood ? "checkmark-circle" : "checkmark-circle-outline"}
                size={24}
                color={understood ? "#4CAF50" : "#8D95A7"}
              />
              <Text
                style={[
                  styles.checklistText,
                  understood && styles.checklistTextActive,
                ]}
              >
                J'ai compris cet exercice
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      <View style={styles.navigationButtons}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePreviousExercise}
          >
            <Ionicons name="chevron-back" size={20} color="#2167b1" />
            <Text style={styles.previousButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !understood && styles.nextButtonDisabled,
            currentIndex === 0 && styles.nextButtonFull,
          ]}
          onPress={handleNextExercise}
          disabled={!understood}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === uniqueExercises.length - 1 ? "Terminer" : "Suivant"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.swipeHint}>
        💡 Swipez pour naviguer entre les exercices
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFCFF",
  },
  safeArea: {
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E6F0",
  },
  backButton: {
    marginRight: 15,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 5,
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
    height: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1E283C",
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  videoText: {
    fontSize: 16,
    color: "#2167b1",
    marginLeft: 10,
    fontWeight: "600",
  },
  tipCard: {
    backgroundColor: "#ffedcc",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
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
  equipmentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
  },
  equipmentTag: {
    backgroundColor: "#EAF3FF",
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
  checklistButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E6F0",
    marginTop: 10,
  },
  checklistButtonActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  checklistText: {
    fontSize: 16,
    color: "#8D95A7",
    marginLeft: 10,
    fontWeight: "600",
  },
  checklistTextActive: {
    color: "#4CAF50",
  },
  navigationButtons: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 10,
  },
  previousButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2167b1",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
  },
  previousButtonText: {
    fontSize: 16,
    color: "#2167b1",
    fontWeight: "bold",
    marginLeft: 5,
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#2167b1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: "#B0B9C8",
  },
  nextButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 10,
  },
  swipeHint: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    fontSize: 12,
    color: "#8D95A7",
    fontStyle: "italic",
  },
  startWorkoutButton: {
    backgroundColor: "#2167b1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  startWorkoutText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  endContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  endTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1E283C",
  },
  endMessage: {
    fontSize: 18,
    textAlign: "center",
    color: "#1E283C",
    marginBottom: 20,
  },
  endImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
});

export default TrainingTutorialScreen;
