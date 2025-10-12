import React, {useCallback, useState} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {SafeAreaView} from "react-native-safe-area-context";
import API from "../services/api";
import moment from "moment";
import {LineChart} from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const HealthQuestionDetailScreen = ({route}) => {
  const navigation = useNavigation();
  const {questionSlug} = route.params;

  const [formResults, setFormResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState();

  const loadFormResults = async () => {
    const res = await API.get(
      `/form-results/findMyElements?formSlug=${questionSlug}`
    );
    setFormResults(res.data || []);
    setLoading(false);
  };

  const loadForm = async () => {
    const res = await API.get(`/forms/?filters[slug][$eq]=${questionSlug}`);
    const formData = res.data.data;
    setForm(
      formData[0] ?? {
        title: "Question inconnue",
        description: "",
      }
    );
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadForm();
      loadFormResults();
    }, [questionSlug])
  );

  const getStats = () => {
    if (formResults.length === 0) return null;

    const scores = formResults.map(r => r.score);
    const values = formResults.map(r => parseInt(r.value)).filter(v => !isNaN(v));

    const bestScore = Math.max(...scores);
    const latestScore = scores[0];
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

    const progress = formResults.length > 1
      ? ((latestScore - scores[scores.length - 1]) / scores[scores.length - 1] * 100).toFixed(0)
      : 0;

    return {
      bestScore,
      latestScore,
      avgScore,
      progress,
      totalEvaluations: formResults.length,
    };
  };

  const getChartData = () => {
    if (formResults.length === 0) return null;

    const sortedResults = [...formResults].reverse();
    const labels = sortedResults.map((_, i) => (i + 1).toString());
    const data = sortedResults.map(r => r.score);

    return { labels, data };
  };

  const renderItem = ({item, index}) => {
    const previous =
      index < formResults.length - 1 ? formResults[index + 1] : null;
    let trend = null;
    let color = "#ccc";

    if (previous) {
      const valCurr = parseInt(item.value);
      const valPrev = parseInt(previous.value);

      if (
        (Number.isInteger(valCurr) && valCurr > valPrev) ||
        item.score > previous.score
      ) {
        trend = "trending-up";
        color = "#4CAF50";
      } else if (
        (Number.isInteger(valCurr) && valCurr < valPrev) ||
        item.score < previous.score
      ) {
        trend = "trending-down";
        color = "#F44336";
      } else {
        trend = "remove";
        color = "#8D95A7";
      }
    }

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.resultDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#8D95A7" />
            <Text style={styles.resultDate}>
              {moment(item.date).format("DD MMMM YYYY")}
            </Text>
          </View>
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: color + "20" }]}>
              <Ionicons name={trend} size={16} color={color} />
            </View>
          )}
        </View>
        <View style={styles.resultContent}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{item.score}</Text>
          </View>
          {Number.isInteger(parseInt(item.value)) && (
            <View style={styles.valueContainer}>
              <Text style={styles.valueLabel}>Valeur</Text>
              <Text style={styles.valueValue}>{item.value}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2167b1"/>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getStats();
  const chartData = getChartData();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E283C"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{form?.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {form?.description?.trim() !== "" && (
          <View style={styles.descriptionCard}>
            <Ionicons name="information-circle-outline" size={20} color="#2167b1" />
            <Text style={styles.description}>{form?.description}</Text>
          </View>
        )}

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="trophy-outline" size={24} color="#2167b1" />
                <Text style={[styles.statValue, { color: "#2167b1" }]}>{stats.bestScore}</Text>
                <Text style={styles.statLabel}>Meilleur</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="star-outline" size={24} color="#4CAF50" />
                <Text style={[styles.statValue, { color: "#4CAF50" }]}>{stats.avgScore}</Text>
                <Text style={styles.statLabel}>Moyenne</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="trending-up-outline" size={24} color="#FF9800" />
                <Text style={[styles.statValue, { color: "#FF9800" }]}>
                  {stats.progress > 0 ? "+" : ""}{stats.progress}%
                </Text>
                <Text style={styles.statLabel}>Progrès</Text>
              </View>
            </View>
            <View style={styles.totalEvaluations}>
              <Ionicons name="checkmark-done-outline" size={18} color="#8D95A7" />
              <Text style={styles.totalEvaluationsText}>
                {stats.totalEvaluations} évaluation{stats.totalEvaluations > 1 ? "s" : ""} réalisée{stats.totalEvaluations > 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        )}

        {chartData && chartData.data.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics-outline" size={20} color="#2167b1" />
              <Text style={styles.sectionTitle}>Évolution</Text>
            </View>
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [{ data: chartData.data }],
              }}
              width={screenWidth - 60}
              height={220}
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
              style={styles.chart}
              bezier
            />
          </View>
        )}

        <View style={styles.historyContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color="#2167b1" />
            <Text style={styles.sectionTitle}>Historique</Text>
          </View>
          {formResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#E0E6F0" />
              <Text style={styles.emptyText}>Pas encore de résultat</Text>
              <Text style={styles.emptySubtext}>
                Ajoutez votre première évaluation
              </Text>
            </View>
          ) : (
            <View>
              {formResults.map((item, index) => (
                <View key={item.id}>
                  {renderItem({ item, index })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("HealthQuestionInputScreen", {questionSlug})
          }
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff"/>
          <Text style={styles.addButtonText}>Ajouter un résultat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E6F0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E283C",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  descriptionCard: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 15,
    margin: 20,
    marginBottom: 10,
    gap: 10,
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: "#1E283C",
    lineHeight: 20,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8D95A7",
    fontWeight: "600",
  },
  totalEvaluations: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  totalEvaluationsText: {
    fontSize: 13,
    color: "#8D95A7",
    fontWeight: "600",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
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
  chart: {
    borderRadius: 16,
  },
  historyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  resultCard: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultDate: {
    fontSize: 13,
    color: "#8D95A7",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  trendBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    flexDirection: "row",
    gap: 20,
  },
  scoreContainer: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#8D95A7",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2167b1",
  },
  valueContainer: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    color: "#8D95A7",
    marginBottom: 4,
  },
  valueValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4CAF50",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8D95A7",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8D95A7",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#B0B9C8",
    marginTop: 4,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2167b1",
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#2167b1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});

export default HealthQuestionDetailScreen;
