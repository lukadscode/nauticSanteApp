import React, { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  const tabs = ["Semaine", "Mois", "Année"];

  const stats = [
    {
      id: "1",
      label: "Séances",
      value: recap.sessionCount || 0,
      icon: "barbell-outline",
    },
    {
      id: "2",
      label: "Types",
      value: recap.sessionTypes || 0,
      icon: "layers-outline",
    },
    {
      id: "3",
      label: "Durée",
      value: convertSecToHumanTiming(recap.totalDuration || 0),
      icon: "time-outline",
    },
  ];

  const questions = [
    { id: "q1", text: "Équilibre", slug: "equilibre" },
    { id: "q2", text: "Souplesse", slug: "souplesse" },
    { id: "q3", text: "Force membres sup.", slug: "force-bras" },
    { id: "q4", text: "Force membres inf.", slug: "force-jambes" },
    { id: "q5", text: "Endurance", slug: "endurance" },
  ];

  const getMonthlyLabels = () => {
    const labels = [];
    const start = moment().startOf("month");
    const end = moment().endOf("month").add(1, "days");
    let current = start.clone();

    while (current.clone().startOf("week").isBefore(end)) {
      const weekStart = current.clone().startOf("week");
      const weekEnd = current.clone().endOf("week");
      labels.push(`${weekStart.format("DD/MM")} au ${weekEnd.format("DD/MM")}`);
      current.add(1, "week");
    }

    return labels;
  };

  const getYearlyLabels = () => [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
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
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecap();
    setRefreshing(false);
  };

  const getChartData = (activeTab) => {
    if (activeTab === "Mois") {
      return{
          labels: monthlyLabels.map((_, i) => (i + 1).toString()),
          realLabels: monthlyLabels,
          data: (activityIndexes || [])
            .map((value) => value.activityIndex)
            .filter((val) => typeof val === "number" && !isNaN(val)),
        }
    
    } else if (activeTab === "Année") {
      return {
        labels: yearlyLabels.map((_, i) => (i + 1).toString()),
        realLabels: yearlyLabels,
        data: (activityIndexes || [])
          .map((value) => value.activityIndex)
          .filter((val) => typeof val === "number" && !isNaN(val)),
      }
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
          <Text
            style={{ textAlign: "center", color: "#8D95A7", marginTop: 10 }}
          >
            Aucune donnée disponible pour cette période.
          </Text>
        );
      }

      return (
        <View style={{ marginTop: 20, paddingBottom: 10 }}>
          <LineChart
            data={{
              labels: chart.labels,
              datasets: [{ data: chart.data }],
            }}
            width={screenWidth - 60}
            height={226}
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
                r: "4",
                strokeWidth: "2",
                stroke: "#2167b1",
              },
              propsForLabels: {
                dy: 16,
              },
            }}
            style={{ borderRadius: 16 }}
            verticalLabelRotation={0}
            fromZero={true}
          />
          <View style={styles.labelBoxWrapperGrid}>
            {chart.realLabels.map((label, i) => (
              <View key={i} style={styles.labelBoxGridItem}>
                <Text style={styles.labelText}>{`${i + 1}. ${label}`}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Suivi</Text>
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
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentContainer}>
          <View style={styles.statRow}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color="#fff" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {(activeTab === "Mois" || activeTab === "Année") && (
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>
                Évolution de ton indice d'activité
              </Text>
              {renderChart()}
            </View>
          )}

          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Suivi des évaluations</Text>
            <RadarChartComponent />
            <Text style={styles.sectionTitle}>Tes évaluations</Text>
            {questions.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={styles.resultItem}
                onPress={() => openQuestionDetails(q.slug)}
              >
                <Text style={styles.resultLabel}>{q.text}</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f9ff" },
  scrollArea: { flex: 1 },
  headerContainer: {
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E283C",
    textAlign: "center",
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#EDEFF3",
    borderRadius: 25,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTabButton: { backgroundColor: "#2167b1" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#8D95A7" },
  activeTabText: { color: "#FFFFFF" },
  contentContainer: { padding: 20 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#2167b1",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700", color: "#fff", marginTop: 10 },
  statLabel: { fontSize: 14, color: "#A9B6D1" },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 10,
  },
  resultItem: {
    backgroundColor: "#2167b1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: { color: "#fff", fontSize: 14 },
  labelBoxWrapperGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  labelBoxGridItem: {
    width: "48%",
    backgroundColor: "#EAF3FF",
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 13,
    color: "#1E283C",
    textAlign: "center",
  },
});

export default HealthSummaryScreen;
