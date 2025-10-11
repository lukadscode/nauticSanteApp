import React, { useState, forwardRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

const CustomInput = forwardRef(
  (
    {
      label,
      placeholder,
      secureTextEntry,
      value,
      onChangeText,
      isDateInput = false,
      isTimeInput = false,
      isNumeric = false,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [touchedParts, setTouchedParts] = useState([false, false, false]);

    const handleDateChange = (event, selectedDate) => {
      if (Platform.OS === "android") {
        setShowPicker(false);
      }

      if (selectedDate) {
        const formatted = moment(selectedDate).format("DD/MM/YYYY");
        onChangeText(formatted);
      }
    };

    const openPicker = () => {
      if (isDateInput) {
        setShowPicker(true);
      }
    };

    const splitTime = (index) => {
      const parts = (value || "").split(":");
      const val = parts[index] || "";
      return touchedParts[index] ? val : ""; // Affiche "" si pas touché
    };

    const updateTimePart = (partIndex, newPart, blur = false) => {
      const parts = [splitTime(0), splitTime(1), splitTime(2)];

      // Update value
      parts[partIndex] = blur
        ? newPart === ""
          ? ""
          : newPart.padStart(2, "0").slice(0, 2)
        : newPart.replace(/\D/g, "").slice(0, 2);

      // Marque ce champ comme touché
      const updatedTouched = [...touchedParts];
      updatedTouched[partIndex] = true;
      setTouchedParts(updatedTouched);

      // Format final (remplace vide par "00")
      onChangeText(parts.map((p) => p || "00").join(":"));
    };

    const formatValue = (val) => {
      if (isDateInput)
        return moment(val, "DD/MM/YYYY", true).isValid() ? val : "";
      if (isTimeInput) return val;
      return val;
    };

    return (
      <View>
        {label && <Text style={styles.label}>{label}</Text>}

        <Pressable
          onPress={openPicker}
          style={styles.container}
          disabled={!isDateInput}
        >
          <View style={styles.inputWrapper}>
            {isTimeInput ? (
              <View style={styles.timeInputsContainer}>
                <TextInput
                  style={styles.timeInput}
                  keyboardType="numeric"
                  placeholder="HH"
                  maxLength={2}
                  value={splitTime(0)}
                  onChangeText={(text) => updateTimePart(0, text)}
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  keyboardType="numeric"
                  placeholder="MM"
                  maxLength={2}
                  value={splitTime(1)}
                  onChangeText={(text) => updateTimePart(1, text)}
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  keyboardType="numeric"
                  placeholder="SS"
                  maxLength={2}
                  value={splitTime(2)}
                  onChangeText={(text) => updateTimePart(2, text)}
                />
              </View>
            ) : (
              <TextInput
                ref={ref}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#A0A0A0"
                secureTextEntry={secureTextEntry && !isPasswordVisible}
                value={formatValue(value)}
                onChangeText={
                  isNumeric
                    ? (text) => onChangeText(text.replace(/\D/g, ""))
                    : onChangeText
                }
                keyboardType={
                  isDateInput || isTimeInput || isNumeric
                    ? "numeric"
                    : "default"
                }
                editable={!isDateInput}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
                blurOnSubmit={blurOnSubmit}
              />
            )}

            {secureTextEntry && !isDateInput && !isTimeInput && (
              <TouchableOpacity
                onPress={() => setIsPasswordVisible((v) => !v)}
                style={styles.iconWrapper}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#A0A0A0"
                />
              </TouchableOpacity>
            )}

            {isDateInput && (
              <TouchableOpacity onPress={openPicker} style={styles.iconWrapper}>
                <Ionicons name="calendar-outline" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            )}
          </View>
        </Pressable>

        {showPicker && (
          <Modal transparent animationType="slide" visible={showPicker}>
            <View style={styles.modalBackground}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={
                      value ? moment(value, "DD/MM/YYYY").toDate() : new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    themeVariant="light"
                    style={styles.dateTimePickerIOS}
                  />
                </View>
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowPicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Terminé</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 5,
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    marginVertical: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  iconWrapper: {
    paddingHorizontal: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
  },
  doneButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    padding: 10,
  },
  doneButtonText: {
    fontWeight: "600",
    color: "#007AFF",
    fontSize: 16,
  },
  dateTimePickerIOS: {
    backgroundColor: "#fff",
  },
  timeInputsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
});

export default CustomInput;
