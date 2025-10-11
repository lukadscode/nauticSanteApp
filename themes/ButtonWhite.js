import React from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { FontSize, FontFamily, Color, Border, Padding } from "./GlobalStyles";

const CustomWhiteButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      {/* La bordure est derrière le bouton */}
      <View style={styles.buttonBorder} />
      <View style={styles.button}>
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%", // Utilise toute la largeur disponible du parent
    marginBottom: 10, // Espace en bas du bouton
    position: "relative", // Nécessaire pour que la bordure et le bouton soient positionnés correctement
  },
  button: {
    borderRadius: Border.br_sm,
    backgroundColor: "#ffffff",
    height: 50, // Hauteur du bouton
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Pour le placement correct du contenu
    zIndex: 2, // Place le bouton au-dessus de la bordure
  },
  buttonText: {
    fontSize: FontSize.size_base,
    letterSpacing: -0.5,
    lineHeight: 19,
    fontWeight: "600",
    fontFamily: FontFamily.dMSansBold,
    color: Color.colorDarkslategray,
    textAlign: "center",
  },
  buttonBorder: {
    position: "absolute", // Positionne la bordure en dehors du bouton
    top: 20, // Place la bordure juste en bas du bouton
    left: 0,
    right: 0,
    height: 35, // Hauteur de la bordure pour qu'elle soit visible
    backgroundColor: "#2167b1", // Couleur bleu clair
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 1, // Assure que la bordure est derrière le bouton
  },
});

export default CustomWhiteButton;
