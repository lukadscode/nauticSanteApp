import React from "react";
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {WebView} from "react-native-webview";
import CustomButton from "../../themes/ButtonBlue";

const VideoExerciseScreen = ({route}) => {
  const {exercise} = route.params || {};
  const navigation = useNavigation();

  const getVimeoEmbedUrl = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const videoId = match?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  };

  const embedUrl = getVimeoEmbedUrl(exercise?.videoUrl);

  if (!exercise || !embedUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Aucune vidéo trouvée ou lien invalide ({exercise?.videoUrl}).</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vidéo Vimeo */}
        <View style={styles.videoContainer}>
          <WebView
            source={{uri: embedUrl}}
            style={styles.webview}
            allowsFullscreenVideo
          />
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#1E283C"/>
            </TouchableOpacity>
            <Text style={styles.sessionTitle}>{session.name}</Text>
            <View style={{width: 24}}/>
          </View>

          {exercise.description && (
            <Text style={styles.descriptionText}>{exercise.description}</Text>
          )}

          {exercise.muscles?.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Muscles sollicités</Text>
              <View style={styles.tagContainer}>
                {exercise.muscles.map((muscle, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Ionicons name="body" size={16} color="#1E283C"/>
                    <Text style={styles.tagText}>{muscle.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {exercise.tools?.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Matériel nécessaire</Text>
              <View style={styles.tagContainer}>
                {exercise.tools.map((tool, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Ionicons
                      name="fitness-outline"
                      size={16}
                      color="#1E283C"
                    />
                    <Text style={styles.tagText}>{tool.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{marginTop: 30}}>
            <CustomButton title="Lancer la séance" onPress={() => {
            }}/>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fbfcff"},
  errorText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "red",
  },
  videoContainer: {
    height: 240,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E283C",
  },
  descriptionText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#1E283C",
  },
});

export default VideoExerciseScreen;
