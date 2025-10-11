import React, {createContext, useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";
import * as Notifications from 'expo-notifications';

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [user, setUserState] = useState(null);
  const [refreshFormScan, setRefreshFormScan] = useState(null);
  const [refreshTraining, setRefreshTraining] = useState(null);
  const [refreshActivityScore, setRefreshActivityScore] = useState(null);


  const login = async (user, jwt, refreshToken) => {
    await setUser(user);
    await AsyncStorage.setItem("userToken", jwt);
    await AsyncStorage.setItem("refreshToken", refreshToken);

  };

  const logout = async () => {
    await setUser(null);
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("refreshToken");

  };

  const getUser = async () => {
    return JSON.parse(await AsyncStorage.getItem("user"));
  };

  const setUser = async (user) => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setUserState(user);
  };

  const refreshUser = async () => {
    try {
      const user = (await API.get('/users/me?populate=avatar')).data
      setUserState(user)
    } catch (error) {
      console.error(error)
    }
  }

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permission refusée pour les notifications push');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      if (user && token !== user.expoPushToken) {
        const modifiedUser = { ...user, expoPushToken: token };
        await API.put("/user/me", modifiedUser);
        await setUser(modifiedUser);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des notifications:', error);
    }
  };

  useEffect(() => {
    loadUserIfConnected();
  }, []);

  useEffect(() => {
    if (user && !user.expoPushToken) {
      registerForPushNotifications();
    }
  }, [user]);

  const loadUserIfConnected = async () => {
    const userSaved = await getUser();
    if (userSaved) {
      setUserState(userSaved);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      setUser,
      logout,
      refreshUser,
      refreshFormScan,
      setRefreshFormScan,
      refreshTraining,
      setRefreshTraining,
      refreshActivityScore,
      setRefreshActivityScore
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
