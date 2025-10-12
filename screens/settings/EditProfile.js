import React, {useContext, useState} from "react";
import {Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {AuthContext} from "../../context/AuthContext";
import API from "../../services/api";
import {EXPO_PUBLIC_ASSETS_URL} from "../../services/env";
import OptimizedImage from "../../components/OptimizedImage";

const EditProfile = ({navigation}) => {
  const appContext = useContext(AuthContext);

  const [email, setEmail] = useState(appContext.user.email);
  const [avatar, setAvatar] = useState(appContext.user.avatar);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    const modifiedUser = appContext.user
    modifiedUser.email = email

    const res = (await API.put('/user/me', modifiedUser))?.data
    res.avatar = avatar
    await appContext.setUser(res)
    Alert.alert("Succès", "Votre profil a été mis à jour avec succès !");
    navigation.goBack();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      try {
        setIsUploading(true)
        const formData = new FormData();

        // Formater l'image comme un fichier
        formData.append('files', {
          uri: result.assets[0].uri,
          name: result.assets[0].uri.split('/').pop(),
          type: result.assets[0].mimeType,
        });
        formData.append("ref", "plugin::users-permissions.user");
        formData.append("refId", appContext.user.id);
        formData.append("field", "avatar");

        const uploadResult = await API.post('/upload', formData)
        setAvatar(uploadResult.data[0]);

        const modifiedUser = appContext.user
        modifiedUser.avatar = uploadResult.data[0]

        await appContext.setUser(modifiedUser)
        setIsUploading(false)

      } catch (err) {
        console.error(err)
      }
    }
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

        <Text style={styles.title}>Modifier le Profil</Text>

        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage}>
            {isUploading ?
              <Text>Loading...</Text>
              :
              (avatar?.formats?.medium?.url ? (
                <OptimizedImage
                  source={{uri: EXPO_PUBLIC_ASSETS_URL + avatar?.formats?.medium?.url}}
                  style={styles.profileImage}
                  contentFit="cover"
                  fallbackIcon="person-circle-outline"
                  fallbackIconSize={60}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="camera" size={30} color="#A0A5B1"/>
                </View>
              ))
            }
          </TouchableOpacity>
          <Text style={styles.imageText}>Modifier la photo de profil</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(value) => setEmail(value.toLowerCase())}
          keyboardType="email-address"
          placeholderTextColor="#A0A5B1"
          enablesReturnKeyAutomatically={true}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
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
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    marginTop: 10,
    fontSize: 14,
    color: "#1E283C",
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
  saveButton: {
    backgroundColor: "#0056D2",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfile;
