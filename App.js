import React from "react";
import "react-native-gesture-handler";
import {enableScreens} from "react-native-screens";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {ApplicationProvider} from "@ui-kitten/components";
import {LogBox, StyleSheet} from "react-native"; // Import SafeAreaView
import * as eva from "@eva-design/eva";
import AuthProvider from "./context/AuthContext";

// Import Screens
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import ResetPassword from "./screens/Auth/ResetPassword";
import OnboardingScreen from "./screens/OnboardingScreen";
import WorkoutListScreen from "./screens/WorkoutListScreen";
import TrainingSessionScreen from "./screens/TrainingSessionScreen";
import RecordResultScreen from "./screens/RecordResultScreen";
import HealthFormScreen from "./screens/HealthFormScreen";
import HealthTestScreen from "./screens/HealthFormScreen";
import ContactSupport from "./screens/settings/ContactSupport";
import PrivacyPolicy from "./screens/settings/PrivacyPolicy";
import TermsOfService from "./screens/settings/TermsOfService";
import NotificationSettings from "./screens/settings/NotificationSettings";
import EditProfile from "./screens/settings/EditProfile";
import MonClub from "./screens/settings/MonClub";
import NewsScreen from "./screens/NewsScreen";
import NotificationSystem from "./screens/NotificationScreen";
import TrainingTutorialScreen from "./screens/Training/TrainingTutorialScreen";
import TrainingSessionPlayerScreen from "./screens/Training/TrainingSessionPlayerScreen";
import ActivityListScreen from "./screens/ActivityListScreen";
import WorkoutCategoryScreen from "./screens/WorkoutCategoryScreen";
import HealthQuestionDetailScreen from "./screens/HealthQuestionDetailScreen";
import HealthQuestionInputScreen from "./screens/HealthQuestionInputScreen";
import VideoExerciseScreen from "./screens/Training/VideoExerciseScreen";
import ConnectedDevices from "./screens/settings/ConnectedDevices";
import WebViewAuth from "./screens/settings/WebViewAuth";
import TrainingHistoryScreen from "./screens/TrainingHistoryScreen";
import TrainingHistoryDetailScreen from "./screens/TrainingHistoryDetailScreen";

// Import Bottom Tabs
import BottomTabs from "./navigation/BottomTabs";
import * as Sentry from "@sentry/react-native";

enableScreens();

Sentry.init({
  dsn: "https://996d2052d0dcc16469c368d92024b659@o4508960612024320.ingest.de.sentry.io/4508960617070672",

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const Stack = createStackNavigator();

// Désactiver les warnings en dev (optionnel)
LogBox.ignoreAllLogs();

// Gérer les erreurs JS globales (utile pour voir les crashs en prod aussi)
if (!__DEV__) {
  const defaultHandler =
    ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.log("🔥 Global JS error:", error);

    // Tu peux aussi envoyer ça à Sentry (ou une autre plateforme)
    Sentry.captureException(error);

    // Appeler le handler original (optionnel)
    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

const linking = {
  prefixes: ['nauticsante://', 'https://app.nauticsante.com'],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Login: 'login',
      Register: 'register',
      Main: {
        screens: {
          Profile: {
            screens: {
              ConnectedDevices: 'profile/connected-devices',
              EditProfile: 'profile/edit',
              NotificationSettings: 'profile/notifications',
            }
          },
          Training: {
            screens: {
              TrainingHistory: 'training/history',
              TrainingHistoryDetail: 'training/history/:id',
            }
          }
        }
      }
    }
  }
};

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <Stack.Navigator>
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPassword}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Main"
              component={BottomTabs}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="WorkoutListScreen"
              component={WorkoutListScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TrainingSessionScreen"
              component={TrainingSessionScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="HealthFormScreen"
              component={HealthFormScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ContactSupport"
              component={ContactSupport}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicy}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TermsOfService"
              component={TermsOfService}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettings}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfile}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="MonClub"
              component={MonClub}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="RecordResultScreen"
              component={RecordResultScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="NewsScreen"
              component={NewsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="NotificationScreen"
              component={NotificationSystem}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TrainingTutorialScreen"
              component={TrainingTutorialScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TrainingSessionPlayerScreen"
              component={TrainingSessionPlayerScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ActivityListScreen"
              component={ActivityListScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="WorkoutCategoryScreen"
              component={WorkoutCategoryScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="HealthTestScreen"
              component={HealthTestScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="HealthQuestionDetailScreen"
              component={HealthQuestionDetailScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="HealthQuestionInputScreen"
              component={HealthQuestionInputScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="VideoExerciseScreen"
              component={VideoExerciseScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ConnectedDevices"
              component={ConnectedDevices}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="WebViewAuth"
              component={WebViewAuth}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TrainingHistory"
              component={TrainingHistoryScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TrainingHistoryDetail"
              component={TrainingHistoryDetailScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="BottomTabs"
              component={BottomTabs}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Fond général de l'application
  },
});
