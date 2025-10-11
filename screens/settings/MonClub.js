import React, {useEffect, useState} from "react";
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import API from "../../services/api";

const MonClub = ({navigation}) => {

  const [club, setClub] = useState(null)
  const [hasClub, setHasClub] = useState(true)

  useEffect(() => {
    fetchMyClub()
  }, []);

  const fetchMyClub = async () => {
    const club = (await API.get('/club/findMy')).data

    if (!club.name) {
      setHasClub(false)
    } else {
      setClub(club)
    }
  }

  const fetchFromFederation = async () => {
    Alert.alert("Cette fonctionnalité n'est pas encore implémentée")
  }

  const handleContactClub = () => {
    Alert.alert(
      "Contacter le club",
      `Vous pouvez appeler le club au ${club.phoneNumber} ou envoyer un email à ${club.email}.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C"/>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        {hasClub && club && <>
          <Text style={styles.title}>Mon Club</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Nom du club:</Text>
            <Text style={styles.infoText}>{club.name}</Text>

            <Text style={styles.infoLabel}>Adresse:</Text>
            <Text style={styles.infoText}>{club.address}</Text>

            <Text style={styles.infoLabel}>Téléphone:</Text>
            <Text style={styles.infoText}>{club.phoneNumber}</Text>

            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoText}>{club.email}</Text>

            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.infoText}>{club.description}</Text>
          </View>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactClub}
          >
            <Text style={styles.contactButtonText}>Contacter le club</Text>
          </TouchableOpacity>
        </>}

        {hasClub && !club && <Text>Chargement...</Text>}

        {!hasClub && <>
          <Text>Aucun club enregistré sur votre compte...</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={fetchFromFederation}
          >
            <Text style={styles.contactButtonText}>Rafraichir les données depuis l'intranet fédéral</Text>
          </TouchableOpacity>
        </>}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
  container: {
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: "#1E283C",
    marginLeft: 10,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 5,
  },
  contactButton: {
    backgroundColor: "#0056D2",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MonClub;
