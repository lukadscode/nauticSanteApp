import React from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const FullScreenModal = ({visible, onClose, announcement}) => {

  const handleClick = () => {
    if (announcement.actionType === 'link') {
      const url = Platform.OS === "ios" ? announcement.destinationIOS : announcement.destinationAndroid;

      Linking.openURL(url).catch(() =>
        Alert.alert("Erreur", "Impossible d'ouvrir le lien.")
      );
    } else if (announcement.actionType === 'inApp') {
      //Handle InApp redirection
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade" // Transition fluide
      transparent={false} // Plein écran
    >
      <View style={styles.modalContainer}>
        {/* Bouton Fermer (croix) */}
        <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
          <Ionicons name="close" size={30} color="#1E283C"/>
        </TouchableOpacity>

        {/* Image */}
        {announcement.image &&
          <Image
            source={{
              uri: announcement.image
            }}
            style={styles.image}
          />
        }

        {/* Titre */}
        <Text style={styles.title}>{announcement.title}</Text>

        {/* Description */}
        <Text style={styles.description}>
          {announcement.description}
        </Text>

        <TouchableOpacity style={styles.updateButton} onPress={handleClick}>
          <Text style={styles.updateButtonText}>{announcement.buttonTitle}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  closeIcon: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  image: {
    width: screenWidth * 0.9,
    height: 220,
    borderRadius: 12,
    marginBottom: 30, // Plus d'espace pour une séparation visuelle
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1E283C",
    textAlign: "center",
    marginBottom: 15, // Meilleur espacement avec le texte
  },
  description: {
    fontSize: 16,
    lineHeight: 24, // Ajout de hauteur de ligne pour une meilleure lisibilité
    color: "#8D95A7",
    textAlign: "center",
    marginBottom: 40, // Plus d'espace avant le bouton
    paddingHorizontal: 10, // Centrage du texte
  },
  updateButton: {
    backgroundColor: "#2167b1",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6, // Ajout d'une ombre pour un effet de relief
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FullScreenModal;
