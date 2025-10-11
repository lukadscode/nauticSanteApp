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

const PrivacyPolicy = ({ navigation }) => {
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

        <Text style={styles.title}>Politique de Confidentialité</Text>

        <Text style={styles.paragraph}>
          Bienvenue sur notre page de Politique de Confidentialité. La
          confidentialité de vos données est primordiale pour la Fédération
          Française d'Aviron et la Fédération Française de Voile.
        </Text>

        <Text style={styles.subtitle}>Données Collectées</Text>
        <Text style={styles.paragraph}>
          Nous collectons les informations que vous fournissez directement,
          comme votre nom, votre adresse e-mail et les messages que vous nous
          envoyez. Nous collectons également des données d'utilisation pour
          améliorer nos services.
        </Text>

        <Text style={styles.subtitle}>Utilisation des Données</Text>
        <Text style={styles.paragraph}>
          Les données collectées sont utilisées pour fournir et améliorer nos
          services, communiquer avec vous, et garantir la sécurité de vos
          informations.
        </Text>

        <Text style={styles.subtitle}>Partage avec des Tiers</Text>
        <Text style={styles.paragraph}>
          Vos informations personnelles ne sont pas partagées avec des tiers,
          sauf lorsque cela est nécessaire pour fournir nos services ou pour
          respecter la loi.
        </Text>

        <Text style={styles.subtitle}>Vos Droits</Text>
        <Text style={styles.paragraph}>
          Vous avez le droit d'accéder, de modifier ou de supprimer vos données
          personnelles. Pour exercer ces droits, veuillez nous contacter.
        </Text>

        <Text style={styles.subtitle}>Protection des Données</Text>
        <Text style={styles.paragraph}>
          Nous mettons en œuvre des mesures de sécurité pour protéger vos
          données contre tout accès non autorisé, toute modification,
          divulgation ou destruction.
        </Text>

        <Text style={styles.subtitle}>Modifications de la Politique</Text>
        <Text style={styles.paragraph}>
          Nous nous réservons le droit de modifier cette politique à tout
          moment. Toute modification sera publiée sur cette page. En continuant
          à utiliser nos services, vous acceptez les modifications apportées.
        </Text>

        <Text style={styles.paragraph}>
          Si vous avez des questions concernant cette Politique de
          Confidentialité, veuillez nous contacter.
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

export default PrivacyPolicy;
