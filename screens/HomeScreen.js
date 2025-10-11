import React, {useContext, useEffect, useState} from "react";
import {Button, RefreshControl, ScrollView, StyleSheet, Text, View,} from "react-native";
import {useNavigation,} from "@react-navigation/native";

import {SafeAreaView} from "react-native-safe-area-context";
import RadarChartComponent from "../screens/RadarChartComponent";
import FullScreenModal from "../themes/FullScreenModal";
import NewsCarousel from "../themes/NewsCarousel";
import TrainingProgress from "../themes/TrainingProgress";
import {AuthContext} from "../context/AuthContext";
import HealthIndexBar from "../themes/HealthIndexBar";
import API from "../services/api";
import {convertSecToHumanTiming, fetchSessionsForActivityIndex,} from "../services/utils";
import moment from "moment";
import Constants from 'expo-constants';
import * as Device from 'expo-device';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const appContext = useContext(AuthContext);

  const navigation = useNavigation();
  const [healthData, setHealthData] = useState(null);
  const [weeklyRecap, setWeeklyRecap] = useState({});
  const [activityScore, setActivityScore] = useState(null);
  const [sliderAnnouncements, setSliderAnnouncements] = useState([]);
  const [popupAnnouncements, setPopupAnnouncements] = useState([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await appContext.refreshUser();
    await checkRicciTestValidation();
    await fetchAnnouncements();
    await loadWeeklyRecap();
    await loadActivityScore();
    appContext.setRefreshFormScan(!appContext.refreshFormScan);
    appContext.setRefreshTraining(!appContext.refreshTraining);
    setRefreshing(false);
  };

  const loadActivityScore = async () => {
    let activityScore = await fetchSessionsForActivityIndex(healthData);

    if (activityScore === null && healthData?.totalScore) {
      activityScore = (healthData.totalScore / 45) * 100;
    }

    setActivityScore(activityScore);
  };

  useEffect(() => {
    if (activityScore == null) {
      loadActivityScore();
    }
  }, [healthData]);


  useEffect(() => {
    checkRicciTestValidation();
    fetchAnnouncements();
    loadWeeklyRecap();

    updateAccount()
    checkCurrentAppVersion()
  }, []);

  const checkCurrentAppVersion = async () => {
    const globalApp = (await API.get('/app-version')).data.data
    const appVersion = Constants.expoConfig?.version || Constants.manifest?.version;

    if (appVersion < globalApp.currentVersion) {
      const versionAnnouncement = {
        title: 'Mise à jour disponbile !',
        description: "Pour profitez des dernières fonctionnalités et correctifs apportés par la version " + globalApp.currentVersion + ", veuillez mettre à jour l'application en cliquant sur le bouton ci-dessous",
        actionType: 'link',
        destinationIOS: 'https://apps.apple.com/fr/app/nauticsant%C3%A9/id6745687507',
        destinationAndroid: 'https://play.google.com/store/apps/details?id=com.undersolutions.nauticsante',
        buttonTitle: 'Mettre à jour',
        active: true,
        type: 'popup',
        federation: "Nautic'Santé"
      }

      if (popupAnnouncements.length > 0) {
        setPopupAnnouncements(
          prev => [...prev, versionAnnouncement]
        )
      } else {
        setPopupAnnouncements([versionAnnouncement])
      }
    }
  }

  const updateAccount = async () => {
    const appVersion = Constants.expoConfig?.version || Constants.manifest?.version;
    const deviceInfo = {
      brand: Device.brand,
      modelName: Device.modelName,
      manufacturer: Device.manufacturer,
      osName: Device.osName,
      osVersion: Device.osVersion,
      designName: Device.designName,
      deviceYearClass: Device.deviceYearClass,
      totalMemory: Device.totalMemory,
      deviceType: Device.deviceType,
      isDevice: Device.isDevice,
      supportedCpuArchitectures: Device.supportedCpuArchitectures,
      platformApiLevel: Device.platformApiLevel,
    };

    const modifiedUser = appContext.user
    modifiedUser.deviceData = JSON.stringify({appVersion, lastConnexion: moment().toISOString(), deviceInfo})
    modifiedUser.lastDeviceType = deviceInfo.osName
    modifiedUser.lastDeviceVersion = deviceInfo.osVersion


    await API.put('/user/me', modifiedUser)
  }

  const loadWeeklyRecap = async () => {
    const startOfWeek = moment().startOf("week").format("YYYY-MM-DD");
    const endOfWeek = moment().endOf("week").format("YYYY-MM-DD");

    const recap = await API.get(
      "/calendar-element/myRecap?dateMin=" +
      startOfWeek +
      "&dateMax=" +
      endOfWeek
    );
    setWeeklyRecap(recap.data);
  };

  const fetchAnnouncements = async () => {
    const results = (await API.get("/announcement/findMy"))?.data?.results;

    const popAnn = results
      .filter((ann) => ann.type === "popup")
      .map((result) => {
        result.visible = true;
        return result;
      })

    if (popupAnnouncements.length > 0) {
      setPopupAnnouncements(
        prev => [...prev, ...popAnn]
      )
    } else {
      setPopupAnnouncements(popAnn)
    }
    setSliderAnnouncements(results.filter((ann) => ann.type === "news-slider"));
  };

  const checkRicciTestValidation = async () => {
    const healthDatas = (await API.get("/health-datas/findMe"))?.data.results;
    setHealthData(healthDatas[0]);

    if (healthDatas.length === 0) {
      navigation.navigate("HealthTestScreen");
    }
  };

  useEffect(() => {
    refreshActivityScore()
  }, [appContext.refreshActivityScore]);

  const refreshActivityScore = async () => {
    if (!healthData) {
      const healthDatas = (await API.get("/health-datas/findMe"))?.data
        .results;
      if (healthDatas.length > 0) {
        setHealthData(healthDatas[0]);
      }
    } else {
      await loadActivityScore();
    }

  }
  const closeAnnouncement = (currentAnnouncement) => {
    const newAnnouncements = popupAnnouncements.filter(
      (announcement) =>
        announcement.documentId !== currentAnnouncement.documentId
    );
    currentAnnouncement.visible = false;
    newAnnouncements.push(currentAnnouncement);

    setPopupAnnouncements(newAnnouncements);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            👋 Bonjour{" "}
            <Text style={styles.userName}>{appContext.user?.firstName}</Text>
          </Text>
          {/*<Ionicons name="notifications-outline" size={24} color="#1E283C"/>*/}
        </View>

        {activityScore !== null ? (
          <HealthIndexBar percentage={activityScore}/>
        ) : (
          <Button
            onPress={() => navigation.navigate("HealthTestScreen")}
            title={"Faire mon premier test"}
          />
        )}

        {popupAnnouncements.map((announcement) => (
          <FullScreenModal
            announcement={announcement}
            key={announcement.documentId}
            visible={announcement.visible}
            onClose={() => closeAnnouncement(announcement)}
          />
        ))}

        <NewsCarousel sliderAnnouncements={sliderAnnouncements}/>

        <TrainingProgress/>

        <Text style={styles.subtitle}>📊 Form'Scan</Text>
        <RadarChartComponent/>

        <Text style={styles.subtitle}>📅 Récapitulatif de la semaine</Text>
        <View style={styles.weekSummary}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardIcon}>⏱</Text>
            <Text style={styles.summaryLabel}>Temps d'entraînement</Text>
            <Text style={styles.summaryValue}>
              {convertSecToHumanTiming(weeklyRecap.totalDuration)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardIcon}>🔥</Text>
            <Text style={styles.summaryLabel}>Nombre de séances</Text>
            <Text style={styles.summaryValue}>{weeklyRecap.sessionCount}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fbfcff",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#8D95A7",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E283C",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    paddingBottom: 10,
  },
  weekSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 6,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E283C",
  },
});

export default HomeScreen;
