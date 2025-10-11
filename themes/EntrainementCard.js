import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Entrainement = () => {
  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>↺</Text>
        <Text style={styles.headerTitle}>RÉSULTAT SUR UNE DISTANCE</Text>
      </View>

      {/* Informations principales */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoValue}>N/A</Text>
          <Text style={styles.infoLabel}>Time cap</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoValue}>2x</Text>
          <Text style={styles.infoLabel}>Répétition</Text>
        </View>
      </View>

      {/* Liste des exercices */}
      <View style={styles.exerciseContainer}>
        <View style={styles.exerciseItem}>
          <Text style={styles.exerciseName}>Rameur</Text>
          <Text style={styles.exerciseDuration}>30 SEC</Text>
        </View>
        <View style={[styles.exerciseItem, styles.exerciseRecovery]}>
          <Text style={styles.exerciseName}>Rameur (Récupération)</Text>
          <Text style={styles.exerciseDuration}>30 SEC</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerIcon: {
    fontSize: 16,
    color: "#8D95A7",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 14,
    color: "#1E283C",
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#1E283C",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  infoValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  infoLabel: {
    fontSize: 12,
    color: "#D3D3D3",
    marginTop: 4,
  },
  exerciseContainer: {
    marginTop: 10,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#EAF3FF",
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseRecovery: {
    backgroundColor: "#D7E7FF",
  },
  exerciseName: {
    fontSize: 14,
    color: "#1E283C",
  },
  exerciseDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E283C",
  },
});

export default Entrainement;
