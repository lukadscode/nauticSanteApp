import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

const HealthIndexBar = ({ percentage }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const validPercentage = Math.min(Math.max(percentage, 0), 100);

  const animatedLeft = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedLeft, {
      toValue: validPercentage,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [validPercentage]);

  const getEncouragement = () => {
    if (validPercentage <= 25)
      return "Chaque pas compte, tu es déjà sur la bonne voie !";
    if (validPercentage <= 36)
      return "Tu es à deux pas des recommandations, continue à bouger !";
    if (validPercentage <= 70)
      return "Tu fais ce qu’il faut pour prendre soin de toi. Ton corps te remercie !";
    return "Ta motivation est inspirante, continue à te faire du bien 💪";
  };

  return (
    <View style={styles.container}>
      {/* Titre + icône info */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          Indice d'activité physique hebdomadaire
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <AntDesign name="questioncircleo" size={18} color="#1E283C" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.indicatorPercentage}>
          {Math.round(validPercentage)}%
        </Text>

        <View style={styles.progressBarWrapper}>
          {/* Indicateur flèche + pourcentage animé */}
          <View style={styles.percentageContainer}>
            <Animated.View
              style={[
                styles.indicatorWrapper,
                {
                  left: animatedLeft.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "98%"],
                  }),
                },
              ]}
            >
              <View style={styles.arrow} />
            </Animated.View>
          </View>

          {/* Barre */}
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={["#fa0707", "#ff9900", "#faff00", "#00cc66", "#0099ff"]}
              locations={[0, 0.15, 0.4, 0.6, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBar}
            />
          </View>

          {/* Graduations */}
          <View style={styles.graduationRow}>
            {["0%", "25%", "50%", "75%", "100%"].map((label, index) => (
              <Text key={index} style={styles.graduationLabel}>
                {label}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Message personnalisé */}
      <Text style={styles.encouragement}>{getEncouragement()}</Text>

      {/* Modal info ANSES */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>À propos de l'indice</Text>
            <Text style={styles.modalText}>
              Cet indice est calculé selon les recommandations de l'ANSES : au
              moins 30 minutes d’activité modérée par jour pour les adultes, ou
              l’équivalent hebdomadaire. Il se base sur la fréquence,
              l’intensité et la durée de tes entraînements.
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  indicatorPercentage: {
    width: 50,
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginRight: 10,
  },
  progressBarWrapper: {
    flex: 1,
    position: "relative",
    paddingRight: 4,
  },
  progressBarContainer: {
    width: "100%",
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EDEFF3",
    overflow: "hidden",
  },
  gradientBar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  percentageContainer: {
    position: "relative",
    width: "100%",
  },
  indicatorWrapper: {
    position: "absolute",
    alignItems: "center",
    top: -14,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1E283C",
  },
  valueBubble: {
    backgroundColor: "#1E283C",
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  graduationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 0,
  },
  graduationLabel: {
    fontSize: 10,
    color: "#8D95A7",
  },
  encouragement: {
    marginTop: 15,
    fontSize: 14,
    color: "#343D4F",
    fontStyle: "italic",
    textAlign: "left",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1E283C",
  },
  modalText: {
    fontSize: 15,
    color: "#1E283C",
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#2167b1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default HealthIndexBar;
