import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const ContactSupport = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    // Simuler l'envoi d'un message
    Alert.alert(
      "Message envoyé",
      "Merci de nous avoir contacté, nous vous répondrons bientôt !"
    );

    // Réinitialiser les champs
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Contact Support</Text>

        <TextInput
          style={styles.input}
          placeholder="Votre nom"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#A0A5B1"
        />

        <TextInput
          style={styles.input}
          placeholder="Votre email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#A0A5B1"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Votre message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          placeholderTextColor="#A0A5B1"
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Envoyer</Text>
          <Ionicons
            name="send"
            size={18}
            color="#FFFFFF"
            style={styles.sendIcon}
          />
        </TouchableOpacity>
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
    alignItems: "center",
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
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#0056D2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  sendIcon: {
    marginLeft: 5,
  },
});

export default ContactSupport;
