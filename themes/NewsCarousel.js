import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { EXPO_PUBLIC_ASSETS_URL } from "../services/env";
import OptimizedImage from "../components/OptimizedImage";

const screenWidth = Dimensions.get("window").width;

const NewsCarousel = ({ sliderAnnouncements }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const intervalRef = useRef(null); // 🔁 Référence persistante

  useEffect(() => {
    if (sliderAnnouncements.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % sliderAnnouncements.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [sliderAnnouncements]); // Ne dépend que des annonces

  const handleAdClick = (news) => {
    navigation.navigate("NewsScreen", { news });
  };

  if (sliderAnnouncements.length === 0) return null;

  return (
    <View>
      <Text style={styles.subtitle}>📰 News</Text>
      <FlatList
        data={sliderAnnouncements}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ref={flatListRef}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleAdClick(item)}
            style={styles.adContainer}
          >
            {item.title ? (
              <View style={styles.imageWrapper}>
                <OptimizedImage
                  source={{
                    uri:
                      EXPO_PUBLIC_ASSETS_URL + item.image?.formats?.medium?.url,
                  }}
                  style={styles.adImage}
                  contentFit="cover"
                  fallbackIcon="newspaper-outline"
                  fallbackIconSize={48}
                />
                <View style={styles.overlay}>
                  <Text style={styles.adTitle}>{item.title}</Text>
                </View>
              </View>
            ) : (
              <OptimizedImage
                source={{
                  uri:
                    EXPO_PUBLIC_ASSETS_URL + item.image?.formats?.medium?.url,
                }}
                style={styles.adImage}
                contentFit="cover"
                fallbackIcon="newspaper-outline"
                fallbackIconSize={48}
              />
            )}
          </TouchableOpacity>
        )}
        pagingEnabled
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          setCurrentIndex(index);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 5,
  },
  adContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  imageWrapper: {
    width: screenWidth - 40,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
  },
  adImage: {
    width: screenWidth - 40,
    height: 150,
    borderRadius: 12,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
  },
});

export default NewsCarousel;
