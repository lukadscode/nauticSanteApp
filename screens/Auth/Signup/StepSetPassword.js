import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import CustomInput from "../../../themes/Input";
import CustomButton from "../../../themes/ButtonBlue";
import { Ionicons } from "@expo/vector-icons";

const Step3 = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backContainer} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color="#007AFF" />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
      <CustomInput
        label="Mot de passe *"
        placeholder="Votre mot de passe"
        secureTextEntry={true}
        value={formData.password}
        onChangeText={(value) => handleInputChange("password", value)}
      />
      <View style={styles.buttonContainer}>
        <CustomButton title="Suivant" onPress={onNext} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 5,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default Step3;
