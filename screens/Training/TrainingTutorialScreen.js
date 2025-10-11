import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ModalAddToCalendar from "../../themes/ModalAddToCalendar";
import {EXPO_PUBLIC_ASSETS_URL} from "../../services/env";

const TrainingTutorialScreen = ({ route }) => {
  const session = route.params?.session;
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTutorialFinished, setIsTutorialFinished] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleNextExercise = () => {
    if (currentIndex < uniqueExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsTutorialFinished(true);
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

  if (isTutorialFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>🎉 Félicitations ! 🎉</Text>
          <Text style={styles.endMessage}>
            Tu as terminé le tutoriel ! Maintenant, il est temps de passer à
            l'entraînement ! 💪🔥
          </Text>
          <Image
            source={{
              uri: "https://cvifs.fr/wp-content/uploads/2020/08/rameur-sport-equipement-fr.jpg",
            }}
            style={styles.endImage}
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
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri:
            EXPO_PUBLIC_ASSETS_URL + (currentExercise.medias?.length > 0 && currentExercise.medias[0]?.formats?.medium?.url ?
              currentExercise.medias[0].formats.medium.url :
              "/uploads/rameur_sport_equipement_fr_5d45d0da25.jpg"),
        }}
        style={styles.headerImage}
        resizeMode="contain"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>

        {currentExercise.video && (
          <TouchableOpacity style={styles.videoButton}>
            <Ionicons name="play-circle" size={40} color="#2167b1" />
            <Text style={styles.videoText}>Voir la vidéo</Text>
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

        {currentExercise.muscles.length > 0 && (
          <Text style={styles.sectionTitle}>Muscles sollicités</Text>
        )}

        {currentExercise.muscles.map((muscle, index) => (
          <Text key={index} style={styles.tipText}>
            {muscle.name}
          </Text>
        ))}

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
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNextExercise}>
        <Text style={styles.nextButtonText}>Suivant</Text>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  videoText: {
    fontSize: 16,
    color: "#2167b1",
    marginLeft: 10,
  },
  tipCard: {
    backgroundColor: "#ffedcc",
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
  equipmentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  equipmentTag: {
    backgroundColor: "#EAF3FF",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 5,
  },
  equipmentText: {
    fontSize: 14,
    color: "#1E283C",
    marginLeft: 5,
  },
  startWorkoutButton: {
    backgroundColor: "#2167b1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  startWorkoutText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#2167b1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
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
