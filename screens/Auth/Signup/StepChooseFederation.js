import React, { useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const Step1 = ({ formData, setFormData, onNext }) => {
  const [animation] = useState(new Animated.Value(1));

  const selectFederation = (federation) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setFormData({ ...formData, federation });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choisissez votre fédération :</Text>

      <View style={styles.optionsContainer}>
        {["ffaviron", "ffvoile"].map((federation) => (
          <TouchableOpacity
            key={federation}
            style={[
              styles.option,
              formData.federation === federation && styles.selectedOption,
            ]}
            onPress={() => selectFederation(federation)}
          >
            <Animated.View
              style={[
                styles.animatedView,
                { transform: [{ scale: animation }] },
              ]}
            >
              <LinearGradient
                colors={
                  formData.federation === federation
                    ? ["#007AFF", "#5A9EE2"]
                    : ["#FFFFFF", "#FFFFFF"]
                }
                style={[
                  styles.gradientBackground,
                  formData.federation === federation && styles.selectedBorder,
                ]}
              >
                <Image
                  source={
                    federation === "ffaviron"
                      ? require("../../../assets/logos/logo-ffa.jpg")
                      : require("../../../assets/logos/logo-ffv.png")
                  }
                  style={styles.logo}
                />
                <Text
                  style={[
                    styles.optionText,
                    formData.federation === federation && styles.selectedText,
                  ]}
                >
                  {federation === "ffaviron" ? "FF Aviron" : "FF Voile"}
                </Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  label: {
    fontSize: 20,
    marginBottom: 25,
    color: "#333333",
    fontWeight: "700",
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    flex: 1,
    borderRadius: 15,
    marginHorizontal: 10,
    elevation: 5,
    overflow: "hidden",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  animatedView: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderWidth: 0,
  },
  selectedBorder: {
    borderColor: "#007AFF",
    borderWidth: 2,
    borderRadius: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginTop: 12,
    textAlign: "center",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
});

export default Step1;
