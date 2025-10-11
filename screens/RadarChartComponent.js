import React, {useContext, useEffect, useRef, useState} from "react";
import {Animated as RNAnimated, Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View,} from "react-native";
import Svg, {Circle, Line, Polygon, Text as SvgText} from "react-native-svg";
import API from "../services/api";
import {AuthContext} from "../context/AuthContext";

const screenWidth = Dimensions.get("window").width;
const size = screenWidth * 0.6;
const radius = size / 2;
const angleStep = (2 * Math.PI) / 5;
const maxScale = 5;

const RadarChartComponent = ({}) => {
  const animatedValue = useRef(new RNAnimated.Value(0)).current;
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [firstResult, setFirstResult] = useState(null);
  const [lastResult, setlastResult] = useState(null);
  const [secondLastResult, setSecondLastResult] = useState(null);

  const appContext = useContext(AuthContext);


  const labels = [
    "Équilibre",
    "Souplesse",
    "Force MS",
    "Force MI",
    "Endurance",
  ]
  const fetchFormResults = async () => {
    const results = (await API.get('/form-results/findMyElements')).data
    const valuesToShow = extractResultsBySlug(results)

    setFirstResult(valuesToShow.first)
    setlastResult(valuesToShow.last)
    setSecondLastResult(valuesToShow.secondLast)
  }

  function extractResultsBySlug(formResults) {
    const slugsOrder = ["equilibre", "souplesse", "force-bras", "force-jambes", "endurance"];

    const first = [];
    const last = [];
    const secondLast = [];

    for (const slug of slugsOrder) {
      const entries = formResults.filter(entry => entry.form.slug === slug);

      if (entries.length === 0) {
        first.push(0);
        last.push(0);
        secondLast.push(0);
      } else {
        const firstValue = entries[entries.length - 1] ?? null;
        const lastValue = entries[0] ?? null;
        const secondValue = entries[1] ?? null;
        first.push(firstValue?.score);

        // Ajoute le dernier seulement s’il est différent du premier
        if (lastValue !== firstValue) {
          last.push(lastValue?.score);
        } else {
          last.push(null);
        }

        // Ajoute l’avant-dernier seulement s’il est différent des deux précédents
        if (secondValue !== null && secondValue !== lastValue && secondValue !== firstValue) {
          secondLast.push(secondValue.score);
        } else {
          secondLast.push(null);
        }
      }
    }

    return {first, last, secondLast};
  }

  useEffect(() => {
    fetchFormResults()
  }, [appContext.refreshFormScan]);

  useEffect(() => {
    RNAnimated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  const getPointCoord = (value, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const scaled = value / maxScale;
    return {
      x: radius + radius * scaled * Math.cos(angle),
      y: radius + radius * scaled * Math.sin(angle),
    };
  };

  const getPoints = (values) =>
    values
      .map((val, i) => {
        const {x, y} = getPointCoord(val, i);
        return `${x},${y}`;
      })
      .join(" ");

  const renderAxes = () =>
    labels.map((_, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const x = radius + radius * Math.cos(angle);
      const y = radius + radius * Math.sin(angle);
      return (
        <Line
          key={`axis-${index}`}
          x1={radius}
          y1={radius}
          x2={x}
          y2={y}
          stroke="#D3D3D3"
          strokeWidth={1}
        />
      );
    });

  const renderLabels = () =>
    labels.map((label, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = radius + labelRadius * Math.cos(angle);
      const y = radius + labelRadius * Math.sin(angle);
      return (
        <SvgText
          key={`label-${index}`}
          x={x}
          y={y}
          fontSize="12"
          fill="#1E283C"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {label}
        </SvgText>
      );
    });

  const handleTouch = (evt) => {
    const {locationX, locationY} = evt.nativeEvent;
    let closestIndex = null;
    let minDist = Infinity;

    labels.forEach((_, i) => {
      const {x, y} = getPointCoord(maxScale, i);
      const dist = Math.sqrt((x - locationX) ** 2 + (y - locationY) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    });

    if (minDist < 80) setSelectedIndex(closestIndex);
    else setSelectedIndex(null);
  };

  if (!firstResult) return null

  return (
    <View style={styles.cardContainer}>
      <TouchableWithoutFeedback onPress={handleTouch}>
        <View style={styles.chartContainer}>
          <Svg
            width={screenWidth}
            height={size}
            viewBox={`0 -40 ${size} ${size + 55}`}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <Circle
                key={i}
                cx={radius}
                cy={radius}
                r={(radius * i) / maxScale}
                fill={i % 2 === 0 ? "#F9FAFB" : "#FFFFFF"}
                stroke="#E0E0E0"
                strokeWidth={1}
              />
            ))}

            {renderAxes()}

            <Polygon
              points={getPoints(firstResult)}
              fill="rgba(255, 99, 132, 0.2)"
              stroke="#FF6384"
              strokeWidth={2}
            />

            {secondLastResult &&
              <Polygon
                points={getPoints(secondLastResult)}
                fill="rgba(90, 164, 240, 0.2)"
                stroke="#2167b1"
                strokeWidth={2}
              />
            }

            {lastResult &&
              <Polygon
                points={getPoints(lastResult)}
                fill="rgba(84, 200, 80, 0.5)"
                stroke="#419b3f"
                strokeWidth={2}
              />
            }

            {renderLabels()}
          </Svg>
        </View>
      </TouchableWithoutFeedback>

      {selectedIndex !== null && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{labels[selectedIndex]}</Text>
          <Text style={styles.infoLine}>
            🟠 Premier :{" "}
            <Text style={styles.infoValue}>{firstResult[selectedIndex]}/5</Text>
          </Text>
          <Text style={styles.infoLine}>
            🔵 Avant Dernier :{" "}
            <Text style={styles.infoValue}>{secondLastResult[selectedIndex]}/5</Text>
          </Text>
          <Text style={styles.infoLine}>
            🟢 Dernier :{" "}
            <Text style={styles.infoValue}>{lastResult[selectedIndex]}/5</Text>
          </Text>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, {backgroundColor: "#FF6384"}]}/>
          <Text style={styles.legendLabel}>Premier</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, {backgroundColor: "#2167b1"}]}/>
          <Text style={styles.legendLabel}>Avant dernier</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, {backgroundColor: "#29b634"}]}/>
          <Text style={styles.legendLabel}>Dernier</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 0,
    marginBottom: 30,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: "100%",
    overflow: "visible",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 14,
    color: "#1E283C",
    fontWeight: "500",
  },
  infoBox: {
    marginTop: 16,
    backgroundColor: "#F0F2F5",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    color: "#1E283C",
  },
  infoLine: {
    fontSize: 13,
    color: "#1E283C",
  },
  infoValue: {
    fontWeight: "600",
  },
});

export default RadarChartComponent;
