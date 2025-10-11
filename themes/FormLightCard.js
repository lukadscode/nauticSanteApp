import React, {useState} from "react";
import {Modal, Pressable, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {getCardColorsByState} from "../services/utils";


const FormLightCard = ({form, calendarEl, index = 0}) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);


  const color = getCardColorsByState(calendarEl?.state);

  const handleViewDetails = () => {
    setModalVisible(false);
    navigation.navigate("HealthQuestionDetailScreen", {questionSlug: form.slug});
  };

  const handleStartSession = () => {
    setModalVisible(false);
    navigation.navigate("HealthQuestionDetailScreen", {questionSlug: form.slug});
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleViewDetails}
        style={[styles.card, {backgroundColor: color.backgroundColor}]}
      >
        <View style={styles.topRow}>
          <Text style={[styles.title, {color: color.textColor}]}>
            {form.title}
          </Text>
          <View style={styles.topRight}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                style={styles.icon}
                color={color.textColor}
              />
            </TouchableOpacity>
          </View>
        </View>

      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={handleViewDetails}
            >
              <Ionicons name="eye-outline" size={20} color="#1E283C"/>
              <Text style={styles.modalText}>Voir les détails</Text>
            </TouchableOpacity>

            {calendarEl.state === 'planned' &&
              <TouchableOpacity
                style={styles.modalItem}
                onPress={handleStartSession}
              >
                <Ionicons name="play-outline" size={20} color="#1E283C"/>
                <Text style={styles.modalText}>Démarrer le test</Text>
              </TouchableOpacity>
            }
          </View>
        </Pressable>
      </Modal>

    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  detail: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  modalText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
  },
  icon: {
    padding: 4
  }
});

export default FormLightCard;
