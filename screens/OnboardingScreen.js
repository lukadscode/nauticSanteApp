import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CustomWhiteButton from "../themes/ButtonWhite";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const slides = [
  {
    title: "Bienvenue 🎉",
    description:
      "Explorez et planifiez vos entraînements pour une santé optimale. 🛶",
    image: require("../assets/images/slide_1.png"),
  },
  {
    title: "Planifiez vos entraînements 🏋️‍♂️",
    description:
      "Créez des routines personnalisées adaptées à vos objectifs. 💪",
    image: require("../assets/images/slide_2.png"),
  },
  {
    title: "Suivez vos progrès 📊",
    description: "Analysez vos performances et progressez à chaque session. 🚀",
    image: require("../assets/images/slide_3.png"),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    autoLog();
  }, []);

  const autoLog = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      navigation.navigate("Main");
    }
  };

  const startAnimation = () => {
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }) => {
    startAnimation();

    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        {/* Texte animé au-dessus des dots */}
        <Animated.View
          style={[
            styles.textAboveDotsContainer,
            {
              opacity: slideAnimation,
              transform: [
                {
                  translateY: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0], // Glisse du bas vers le haut
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={require("../assets/logos/logo_ns_v.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => String(index)}
        renderItem={renderItem}
        onScroll={(event) => {
          const pageIndex = Math.round(
            event.nativeEvent.contentOffset.x / screenWidth
          );
          setActiveSlide(pageIndex);
        }}
      />
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              activeSlide === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <View style={{ width: "47%" }}>
          <CustomWhiteButton
            title="Se connecter"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
        <View style={{ width: "47%" }}>
          <CustomWhiteButton
            title="Créer un compte"
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
  logoContainer: {
    position: "absolute",
    top: 10,
    zIndex: 10,
  },
  logo: {
    width: 200,
    height: 100,
    alignSelf: "center",
    resizeMode: "contain",
  },
  slide: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: screenWidth,
    height: screenHeight,
    resizeMode: "cover",
    position: "absolute",
  },
  textAboveDotsContainer: {
    position: "absolute",
    bottom: screenHeight * 0.2,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333333",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#555555",
  },
  paginationContainer: {
    position: "absolute",
    bottom: screenHeight * 0.15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#ffffff",
    width: 12,
    height: 12,
  },
  buttonContainer: {
    position: "absolute",
    bottom: screenHeight * 0.05,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
});

export default OnboardingScreen;
