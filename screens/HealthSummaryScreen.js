import React, { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RadarChartComponent from "../screens/RadarChartComponent";
import moment from "moment/moment";
import API from "../services/api";
import {
  convertSecToHumanTiming,
  getActivityIndexByMonth,
  getActivityIndexByWeek,
} from "../services/utils";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const HealthSummaryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Semaine");
  const [isRefreshing, setRefreshing] = useState(false);
  const [recap, setRecap] = useState({});
  const [activityIndexes, setActivityIndexes] = useState([]);
  const [animatedValue] = useState(new Animated.Value(0));

  const tabs = ["Semaine", "Mois", "Année"];

  const stats = [
    {
      id: "1",
      label: "Séances",
      value: recap.sessionCount || 0,
      icon: "barbell-outline",
      color: "#2167b1",
      bgColor: "#E3F2FD",
    },
    {
      id: "2",
      label: "Types",
      value: recap.sessionTypes || 0,
      icon: "layers-outline",
      color: "#FF6B6B",
      bgColor: "#FFE5E5",
    },
    {
      id: "3",
      label: "Durée",
      value: convertSecToHumanTiming(recap.totalDuration || 0),
      icon: "time-outline",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    },
  ];

  const questions = [
    { id: "q1", text: "Équilibre", slug: "equilibre", icon: "body-outline", color: "#9C27B0" },
    { id: "q2", text: "Souplesse", slug: "souplesse", icon: "fitness-outline", color: "#FF9800" },
    { id: "q3", text: "Force membres sup.", slug: "force-bras", icon: "barbell-outline", color: "#2196F3" },
    { id: "q4", text: "Force membres inf.", slug: "force-jambes", icon: "walk-outline", color: "#4CAF50" },
    { id: "q5", text: "Endurance", slug: "endurance", icon: "heart-outline", color: "#F44336" },
  ];

  const getMonthlyLabels = () => {
    const labels = [];
    const start = moment().startOf("month");
    const end = moment().endOf("month").add(1, "days");
    let current = start.clone();

    while (current.clone().startOf("week").isBefore(end)) {
      const weekStart = current.clone().startOf("week");
      const weekEnd = current.clone().endOf("week");
      labels.push(`${weekStart.format("DD/MM")} - ${weekEnd.format("DD/MM")}`);
      current.add(1, "week");
    }

    return labels;
  };

  const getYearlyLabels = () => [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];

  const monthlyLabels = getMonthlyLabels();
  const yearlyLabels = getYearlyLabels();

  const loadRecap = async () => {
    let startDate = "";
    let endDate = "";

    switch (activeTab) {
      case "Mois":
        startDate = moment().startOf("month").format("YYYY-MM-DD");
        endDate = moment().endOf("month").add(1, "days").format("YYYY-MM-DD");
        break;
      case "Année":
        startDate = moment().startOf("year").format("YYYY-MM-DD");
        endDate = moment().endOf("year").format("YYYY-MM-DD");
        break;
      default:
        startDate = moment().startOf("week").format("YYYY-MM-DD");
        endDate = moment().endOf("week").format("YYYY-MM-DD");
    }

    const recap = API.get(
      "/calendar-element/myRecap?dateMin=" + startDate + "&dateMax=" + endDate
    );

    if (activeTab === "Mois") {
      setActivityIndexes(await getActivityIndexByWeek());
    } else if (activeTab === "Année") {
      setActivityIndexes(await getActivityIndexByMonth());
    } else {
      setActivityIndexes([]);
    }

    setRecap((await recap).data);
  };

  useEffect(() => {
    loadRecap();
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 20,
      friction: 7,
    }).start();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecap();
    setRefreshing(false);
  };

  const getChartData = (activeTab) => {
    if (activeTab === "Mois") {
      return {
        labels: monthlyLabels.map((_, i) => `S${i + 1}`),
        realLabels: monthlyLabels,
        data: (activityIndexes || [])
          .map((value) => value.activityIndex)
          .filter((val) => typeof val === "number" && !isNaN(val)),
      };
    } else if (activeTab === "Année") {
      return {
        labels: yearlyLabels,
        realLabels: yearlyLabels,
        data: (activityIndexes || [])
          .map((value) => value.activityIndex)
          .filter((val) => typeof val === "number" && !isNaN(val)),
      };
    }
  };

  const openQuestionDetails = (slug) => {
    navigation.navigate("HealthQuestionDetailScreen", { questionSlug: slug });
  };

  const renderChart = () => {
    if (activeTab === "Mois" || activeTab === "Année") {
      const chart = getChartData(activeTab);

      if (!chart.data || chart.data.length === 0) {
        return (
          <View style={styles.emptyChartContainer}>
            <Ionicons name="bar-chart-outline" size={48} color="#E0E6F0" />
            <Text style={styles.emptyChartText}>
              Aucune donnée disponible pour cette période
            </Text>
            <Text style={styles.emptyChartSubtext}>
              Commencez à enregistrer vos entraînements
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels: chart.labels,
              datasets: [{ data: chart.data }],
            }}
            width={screenWidth - 80}
            height={220}
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 103, 177, ${opacity})`,
              labelColor: () => "#8D95A7",
              style: { borderRadius: 16 },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#2167b1",
                fill: "#fff",
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: "#E0E6F0",
              },
            }}
            style={styles.lineChart}
            bezier
            verticalLabelRotation={0}
            fromZero={true}
          />
          {activeTab === "Mois" && (
            <View style={styles.legendContainer}>
              {chart.realLabels.map((label, i) => (
                <View key={i} style={styles.legendItem}>
                  <Text style={styles.legendLabel}>S{i + 1}:</Text>
                  <Text style={styles.legendValue} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Suivi</Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === "Semaine" && moment().format("WW")}
          {activeTab === "Mois" && moment().format("MMMM YYYY")}
          {activeTab === "Année" && moment().format("YYYY")}
        </Text>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.statRow,
              {
                opacity: animatedValue,
                transform: [
                  {
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {stats.map((stat, index) => (
              <Animated.View
                key={stat.id}
                style={[
                  styles.statCard,
                  { backgroundColor: stat.bgColor },
                  {
                    opacity: animatedValue,
                    transform: [
                      {
                        scale: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                  <Ionicons name={stat.icon} size={20} color="#fff" />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          {(activeTab === "Mois" || activeTab === "Année") && (
            <View style={styles.chartContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={20} color="#2167b1" />
                <Text style={styles.sectionTitle}>Évolution d'activité</Text>
              </View>
              {renderChart()}
            </View>
          )}

          <View style={styles.chartContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics-outline" size={20} color="#2167b1" />
              <Text style={styles.sectionTitle}>Radar des capacités</Text>
            </View>
            <RadarChartComponent />
          </View>

          <View style={styles.evaluationsContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-done-outline" size={20} color="#2167b1" />
              <Text style={styles.sectionTitle}>Vos évaluations</Text>
            </View>
            <Text style={styles.evaluationsSubtitle}>
              Suivez l'évolution de vos capacités physiques
            </Text>
            {questions.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={styles.evaluationItem}
                onPress={() => openQuestionDetails(q.slug)}
                activeOpacity={0.7}
              >
                <View style={[styles.evaluationIcon, { backgroundColor: q.color + "20" }]}>
                  <Ionicons name={q.icon} size={22} color={q.color} />
                </View>
                <Text style={styles.evaluationLabel}>{q.text}</Text>
                <Ionicons name="chevron-forward" size={20} color="#8D95A7" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
  scrollArea: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#ffffff",
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E283C",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8D95A7",
    textAlign: "center",
    marginBottom: 15,
    textTransform: "capitalize",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F5F7FA",
    borderRadius: 25,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: "#2167b1",
    shadowColor: "#2167b1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8D95A7",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  contentContainer: {
    padding: 20,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#8D95A7",
    fontWeight: "600",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E283C",
  },
  chartWrapper: {
    alignItems: "center",
  },
  lineChart: {
    borderRadius: 16,
  },
  legendContainer: {
    marginTop: 15,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    minWidth: "45%",
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2167b1",
    marginRight: 4,
  },
  legendValue: {
    fontSize: 11,
    color: "#8D95A7",
    flex: 1,
  },
  emptyChartContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyChartText: {
    fontSize: 14,
    color: "#8D95A7",
    marginTop: 12,
    fontWeight: "600",
  },
  emptyChartSubtext: {
    fontSize: 12,
    color: "#B0B9C8",
    marginTop: 4,
  },
  evaluationsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  evaluationsSubtitle: {
    fontSize: 13,
    color: "#8D95A7",
    marginBottom: 15,
  },
  evaluationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  evaluationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  evaluationLabel: {
    flex: 1,
    color: "#1E283C",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default HealthSummaryScreen;
