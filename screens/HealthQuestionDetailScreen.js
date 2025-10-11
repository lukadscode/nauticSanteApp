import React, {useCallback, useState} from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import API from "../services/api";
import moment from "moment";

const HealthQuestionDetailScreen = ({route}) => {
  const navigation = useNavigation();
  const {questionSlug} = route.params;
  const insets = useSafeAreaInsets();

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
        trend = "arrow-up";
        color = "#4CAF50";
      } else if (
        (Number.isInteger(valCurr) && valCurr < valPrev) ||
        item.score < previous.score
      ) {
        trend = "arrow-down";
        color = "#F44336";
      } else {
        trend = "remove";
        color = "#999";
      }
    }

    return (
      <View style={styles.itemContainerRow}>
        <Text style={styles.itemDate}>
          {moment(item.date).format("DD/MM/YYYY")}
        </Text>
        {trend && (
          <Ionicons
            name={trend}
            size={20}
            color={color}
            style={{marginLeft: 8}}
          />
        )}
        <Text style={styles.itemScore}>
          Score : {item.score} point{item.score > 1 ? "s" : ""}
          {Number.isInteger(parseInt(item.value)) ? ` - ${item.value}` : ""}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2167b1"/>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color="#1E283C"/>
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      {/* Question card style harmonisé */}
      <View style={styles.card}>
        <Text style={styles.title}>{form?.title}</Text>
        {form?.description?.trim() !== "" && (
          <Text style={styles.description}>{form?.description}</Text>
        )}
      </View>

      <View style={{flex: 1}}>
        {formResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Pas encore de résultat</Text>
          </View>
        ) : (
          <FlatList
            data={formResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View
        style={[styles.fixedAddButtonContainer, {bottom: insets.bottom + 16}]}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("HealthQuestionInputScreen", {questionSlug})
          }
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff"/>
          <Text style={styles.addButtonText}>Ajouter un résultat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f9ff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  backText: {
    fontSize: 16,
    color: "#1E283C",
    marginLeft: 6,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#e6f0fb",
    borderRadius: 20,
    padding: 20,
    margin: 10,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: "#495867",
  },
  itemContainerRow: {
    backgroundColor: "#2167b1",
    padding: 14,
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemDate: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  itemScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "right",
    flexShrink: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  listContent: {
    paddingBottom: 100,
  },
  fixedAddButtonContainer: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2167b1",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});

export default HealthQuestionDetailScreen;
