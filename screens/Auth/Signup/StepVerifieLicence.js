import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "../../../themes/ButtonBlue";

const Step4 = ({ formData, onNext, onBack }) => {
  return (
    <View>
      <Text style={styles.info}>
        Veuillez vérifier vos informations avant de soumettre :
      </Text>
      {formData.federation === "ffaviron" ? (
        <>
          <Text>Numéro de licence : {formData.licenseNumber}</Text>
          <Text>Date de naissance : {formData.birthDate}</Text>
        </>
      ) : (
        <>
          <Text>Nom : {formData.lastName}</Text>
          <Text>Prénom : {formData.firstName}</Text>
          <Text>Date de naissance : {formData.birthDate}</Text>
          <Text>Sexe : {formData.gender === "M" ? "M" : "F"}</Text>
        </>
      )}
      <CustomButton title="Créer mon compte" onPress={onNext} />
      <CustomButton title="Retour" onPress={onBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  info: {
    fontSize: 16,
    color: "#343D4F",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default Step4;
