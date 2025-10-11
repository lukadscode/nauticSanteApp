import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomInput from "../../../themes/Input";
import CustomButton from "../../../themes/ButtonBlue";
import { Ionicons } from "@expo/vector-icons";

const Step2 = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGenderSelection = (gender) => {
    setFormData({ ...formData, gender });
  };

  const handleNext = () => {
    if (formData.federation === "ffvoile" && formData.birthDate) {
      const [day, month, year] = formData.birthDate.split("/");
      const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;
      setFormData({ ...formData, birthDate: formattedDate });
    }
    onNext();
  };

  return (
    <View style={styles.container}>
      {/* Texte retour avec flèche */}
      <TouchableOpacity style={styles.backContainer} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color="#007AFF" />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      {formData.federation === "ffaviron" ? (
        <>
          <CustomInput
            label="Numéro de licence *"
            placeholder="Votre numéro de licence"
            isNumeric={true}
            value={formData.licenseNumber}
            onChangeText={(value) => handleInputChange("licenseNumber", value)}
          />
          <CustomInput
            label="Date de naissance"
            placeholder="JJ/MM/AAAA"
            isDateInput={true}
            value={formData.birthDate}
            onChangeText={(value) => handleInputChange("birthDate", value)}
          />
        </>
      ) : (
        <>
          <CustomInput
            label="Nom *"
            placeholder="Votre nom"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange("lastName", value)}
          />
          <CustomInput
            label="Prénom *"
            placeholder="Votre prénom"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange("firstName", value)}
          />
          <CustomInput
            label="Date de naissance"
            placeholder="JJ/MM/AAAA"
            isDateInput={true}
            value={formData.birthDate}
            onChangeText={(value) => handleInputChange("birthDate", value)}
          />
          <Text style={styles.genderLabel}>Sexe</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={
                formData.gender === "M"
                  ? [styles.genderButton, styles.genderSelected]
                  : styles.genderButton
              }
              onPress={() => handleGenderSelection("M")}
            >
              <Ionicons
                name="male-outline"
                size={20}
                color={formData.gender === "M" ? "#FFFFFF" : "#4B5563"}
              />
              <Text
                style={
                  formData.gender === "M"
                    ? styles.genderTextSelected
                    : styles.genderText
                }
              >
                Homme
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                formData.gender === "F"
                  ? [styles.genderButton, styles.genderSelected]
                  : styles.genderButton
              }
              onPress={() => handleGenderSelection("F")}
            >
              <Ionicons
                name="female-outline"
                size={20}
                color={formData.gender === "F" ? "#FFFFFF" : "#4B5563"}
              />
              <Text
                style={
                  formData.gender === "F"
                    ? styles.genderTextSelected
                    : styles.genderText
                }
              >
                Femme
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <CustomButton title="Suivant" onPress={handleNext} />
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
  genderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  genderButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  genderSelected: {
    backgroundColor: "#2167b1",
    borderColor: "#2167b1",
  },
  genderText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  genderTextSelected: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default Step2;
