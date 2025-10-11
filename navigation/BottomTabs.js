import React from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CalendarScreen from "../screens/CalendarScreen";
import WorkoutListScreen from "../screens/WorkoutListScreen";
import HealthSummaryScreen from "../screens/HealthSummaryScreen";
import {Ionicons} from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === "Accueil") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Séances") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Planning") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Suivi") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "Plus") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color}/>;
        },
        tabBarActiveTintColor: "#0056D2",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Cache les en-têtes par défaut
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen}/>
      <Tab.Screen name="Séances" component={WorkoutListScreen}/>
      <Tab.Screen name="Planning" component={CalendarScreen}/>
      <Tab.Screen name="Suivi" component={HealthSummaryScreen}/>
      <Tab.Screen name="Plus" component={ProfileScreen}/>
    </Tab.Navigator>
  );
}

export default BottomTabs;
