import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const TermsOfService = ({ navigation }) => {
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

        <Text style={styles.title}>Conditions d'Utilisation</Text>

        <Text style={styles.paragraph}>
          En utilisant notre application, vous acceptez les termes et conditions
          suivants. Veuillez les lire attentivement.
        </Text>

        <Text style={styles.subtitle}>Responsabilités de l'Utilisateur</Text>
        <Text style={styles.paragraph}>
          Les utilisateurs sont responsables de fournir des informations exactes
          et à jour. Toute utilisation abusive de l'application est strictement
          interdite.
        </Text>

        <Text style={styles.subtitle}>Activités Interdites</Text>
        <Text style={styles.paragraph}>
          Vous vous engagez à ne pas utiliser notre service pour des activités
          illégales ou pour enfreindre les lois de votre juridiction.
        </Text>

        <Text style={styles.subtitle}>Limitation de Responsabilité</Text>
        <Text style={styles.paragraph}>
          La Fédération Française d'Aviron et la Fédération Française de Voile
          ne peuvent être tenues responsables des dommages résultant de
          l'utilisation ou de l'incapacité à utiliser nos services, y compris,
          mais sans s'y limiter, les dommages directs, indirects ou accessoires.
        </Text>

        <Text style={styles.subtitle}>Résiliation</Text>
        <Text style={styles.paragraph}>
          Nous nous réservons le droit de suspendre ou de résilier votre accès
          au service à notre seule discrétion, sans préavis, en cas de
          comportement que nous considérons comme une violation de ces
          conditions.
        </Text>

        <Text style={styles.subtitle}>Modifications des Conditions</Text>
        <Text style={styles.paragraph}>
          Nous nous réservons le droit de modifier ces conditions à tout moment.
          L'utilisation continue du service après les modifications constitue
          une acceptation des conditions mises à jour.
        </Text>

        <Text style={styles.paragraph}>
          Merci d'utiliser nos services. Si vous avez des questions concernant
          ces conditions, veuillez contacter le support.
        </Text>
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
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E283C",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 15,
  },
});

export default TermsOfService;
