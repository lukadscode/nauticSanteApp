import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Import des écrans
import ApiExampleScreen from "../screens/TrainingSearchScreen";
import WorkoutListScreen from "../screens/PlanTrainingPages/WorkoutListScreen";
import WeeklyCalendarScreen from "../screens/PlanTrainingPages/WeeklyCalendarScreen";
import MonthlyCalendarScreen from "../screens/PlanTrainingPages/MonthlyCalendarScreen";

const Stack = createStackNavigator();

const TrainingStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ApiExampleScreen"
        component={ApiExampleScreen}
        options={{ title: "API Example" }}
      />
      <Stack.Screen
        name="WorkoutListScreen"
        component={WorkoutListScreen}
        options={{ title: "Liste des entraînements" }}
      />
      <Stack.Screen
        name="WeeklyCalendarScreen"
        component={WeeklyCalendarScreen}
        options={{ title: "Calendrier Hebdomadaire" }}
      />
      <Stack.Screen
        name="MonthlyCalendarScreen"
        component={MonthlyCalendarScreen}
        options={{ title: "Calendrier Mensuel" }}
      />
    </Stack.Navigator>
  );
};

export default TrainingStack;
