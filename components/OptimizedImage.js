import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const OptimizedImage = ({
  source,
  style,
  contentFit = "cover",
  placeholder = null,
  transition = 300,
  fallbackIcon = "image-outline",
  fallbackIconSize = 48,
  fallbackIconColor = "#E0E0E0",
  cachePolicy = "memory-disk",
  priority = "normal",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error) => {
    console.warn("Image loading error:", error);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {!hasError ? (
        <>
          <Image
            source={source}
            style={[StyleSheet.absoluteFill, style]}
            contentFit={contentFit}
            placeholder={placeholder || blurhash}
            transition={transition}
            cachePolicy={cachePolicy}
            priority={priority}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            {...props}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#2167b1" />
            </View>
          )}
        </>
      ) : (
        <View style={[styles.errorContainer, style]}>
          <Ionicons
            name={fallbackIcon}
            size={fallbackIconSize}
            color={fallbackIconColor}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OptimizedImage;
