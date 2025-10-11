import {Modal, Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, {useContext, useState} from "react";
import API from "../services/api";
import {AuthContext} from "../context/AuthContext";

const ModalAddToCalendar = ({session, activity, modalVisible, setModalVisible, setCalendarEl}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const appContext = useContext(AuthContext)
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleConfirmDate = async () => {
    setModalVisible(false);

    let calendarEl = null
    if (session) {
      calendarEl = await API.post("/calendar-element/createMyElement", {
        date: selectedDate.toISOString(),
        session: session.documentId,
      });
    } else {
      calendarEl = await API.post("/calendar-element/createMyElement", {
        date: selectedDate.toISOString(),
        activity: activity.documentId,
      });
    }

    setCalendarEl(calendarEl.data)
    appContext.setRefreshTraining(!appContext.refreshTraining)

    alert(
      `Séance ajoutée au calendrier pour le ${selectedDate.toLocaleDateString()}`
    );
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      width: "80%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    dateButton: {
      backgroundColor: "#f0f0f0",
      padding: 10,
      borderRadius: 8,
      marginTop: 10,
    },
    dateText: {
      fontSize: 16,
    },
    modalButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: "#ccc",
      padding: 10,
      borderRadius: 8,
      width: "45%",
      alignItems: "center",
    },
    cancelText: {
      color: "#fff",
      fontWeight: "bold",
    },
    confirmButton: {
      backgroundColor: "#2167b1",
      padding: 10,
      borderRadius: 8,
      width: "45%",
      alignItems: "center",
    },
    confirmText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });

  return <Modal visible={modalVisible} transparent={true}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Sélectionnez une date</Text>
        {Platform.OS !== "ios" &&
          <>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={"default"}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}
          </>
        }

        {Platform.OS === "ios" &&
          <DateTimePicker
            value={selectedDate}
            mode="date"
            onChange={(event, date) => {
              if (date) setSelectedDate(date);
            }}
            style={{backgroundColor: '#2167b1', borderRadius: 10, paddingRight: 6}}
          />
        }


        <View style={styles.modalButtonRow}>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirmDate}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>


}


export default ModalAddToCalendar