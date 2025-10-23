import { Platform } from "react-native";
import AppleHealthKit from "react-native-health";
import GoogleFit, { Scopes } from "@ovalmoney/react-native-fitness";
import moment from "moment";
import API from "./api";

const STEPS_THRESHOLD = 6000;
const WALKING_DURATION_PER_6000_STEPS = 30;

class HealthSyncService {
  constructor() {
    this.initialized = false;
  }

  async initializeAppleHealth() {
    if (Platform.OS !== "ios") return false;

    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        ],
      },
    };

    return new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (error) => {
        if (error) {
          console.error("Apple Health initialization error:", error);
          reject(error);
          return;
        }
        this.initialized = true;
        resolve(true);
      });
    });
  }

  async initializeGoogleFit() {
    if (Platform.OS !== "android") return false;

    try {
      const authorized = await GoogleFit.isAuthorized();
      if (authorized) {
        this.initialized = true;
        return true;
      }

      const result = await GoogleFit.authorize([
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_LOCATION_READ,
      ]);

      this.initialized = result.success;
      return result.success;
    } catch (error) {
      console.error("Google Fit initialization error:", error);
      return false;
    }
  }

  async getAppleHealthData(startDate, endDate) {
    if (Platform.OS !== "ios" || !this.initialized) return null;

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    return new Promise((resolve) => {
      const results = {
        steps: 0,
        distance: 0,
        calories: 0,
      };

      AppleHealthKit.getDailyStepCountSamples(options, (err, stepsData) => {
        if (!err && stepsData && stepsData.length > 0) {
          results.steps = stepsData.reduce((sum, item) => sum + item.value, 0);
        }

        AppleHealthKit.getDailyDistanceWalkingRunningSamples(
          options,
          (err, distanceData) => {
            if (!err && distanceData && distanceData.length > 0) {
              results.distance = distanceData.reduce(
                (sum, item) => sum + item.value,
                0
              );
            }

            AppleHealthKit.getActiveEnergyBurned(options, (err, caloriesData) => {
              if (!err && caloriesData && caloriesData.length > 0) {
                results.calories = caloriesData.reduce(
                  (sum, item) => sum + item.value,
                  0
                );
              }

              resolve(results);
            });
          }
        );
      });
    });
  }

  async getGoogleFitData(startDate, endDate) {
    if (Platform.OS !== "android" || !this.initialized) return null;

    try {
      const stepsData = await GoogleFit.getDailySteps(startDate, endDate);
      const distanceData = await GoogleFit.getDailyDistanceSamples(
        startDate,
        endDate
      );
      const caloriesData = await GoogleFit.getDailyCalorieSamples(
        startDate,
        endDate
      );

      let totalSteps = 0;
      if (stepsData && stepsData.length > 0) {
        totalSteps = stepsData.reduce((sum, day) => {
          const daySteps = day.steps.reduce((s, step) => s + step.value, 0);
          return sum + daySteps;
        }, 0);
      }

      let totalDistance = 0;
      if (distanceData && distanceData.length > 0) {
        totalDistance = distanceData.reduce(
          (sum, item) => sum + (item.distance || 0),
          0
        );
      }

      let totalCalories = 0;
      if (caloriesData && caloriesData.length > 0) {
        totalCalories = caloriesData.reduce(
          (sum, item) => sum + (item.calorie || 0),
          0
        );
      }

      return {
        steps: totalSteps,
        distance: totalDistance,
        calories: totalCalories,
      };
    } catch (error) {
      console.error("Google Fit data fetch error:", error);
      return null;
    }
  }

  async syncHealthData(date = new Date()) {
    const source = Platform.OS === "ios" ? "apple_health" : "google_fit";
    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    let healthData = null;

    if (Platform.OS === "ios") {
      if (!this.initialized) {
        await this.initializeAppleHealth();
      }
      healthData = await this.getAppleHealthData(startDate, endDate);
    } else if (Platform.OS === "android") {
      if (!this.initialized) {
        await this.initializeGoogleFit();
      }
      healthData = await this.getGoogleFitData(startDate, endDate);
    }

    if (!healthData) {
      return { success: false, error: "Unable to fetch health data" };
    }

    try {
      const response = await API.get(
        `/health-sync-sessions?filters[sync_date][$eq]=${moment(date).format("YYYY-MM-DD")}&filters[source][$eq]=${source}`
      );

      const existingSession = response.data.data?.[0];

      if (existingSession) {
        const { data } = await API.put(
          `/health-sync-sessions/${existingSession.id}`,
          {
            data: {
              steps: healthData.steps,
              distance: healthData.distance,
              calories: healthData.calories,
            },
          }
        );

        return {
          success: true,
          data: { ...data.data, id: data.data.documentId },
          updated: true,
        };
      } else {
        const { data } = await API.post("/health-sync-sessions", {
          data: {
            source,
            steps: healthData.steps,
            distance: healthData.distance,
            calories: healthData.calories,
            sync_date: moment(date).format("YYYY-MM-DD"),
            synced_to_training: false,
          },
        });

        return {
          success: true,
          data: { ...data.data, id: data.data.documentId },
          updated: false,
        };
      }
    } catch (error) {
      console.error("Strapi sync error:", error);
      return { success: false, error: error.message };
    }
  }

  async convertStepsToTraining(sessionId) {
    try {
      const { data: sessionResponse } = await API.get(
        `/health-sync-sessions/${sessionId}`
      );

      const session = sessionResponse.data;

      if (!session || session.synced_to_training) {
        return { success: false, error: "Session not found or already synced" };
      }

      if (session.steps < STEPS_THRESHOLD) {
        return {
          success: false,
          error: `Insufficient steps. Need ${STEPS_THRESHOLD}, have ${session.steps}`,
        };
      }

      const multiplier = Math.floor(session.steps / STEPS_THRESHOLD);
      const durationMinutes = WALKING_DURATION_PER_6000_STEPS * multiplier;

      const trainingData = {
        date: session.sync_date,
        realDuration: durationMinutes * 60,
        distance: session.distance / 1000,
        mood: 1,
        state: "finished",
      };

      const response = await API.post(
        "/calendar-element/createMyActivityElement",
        trainingData
      );

      await API.put(`/health-sync-sessions/${sessionId}`, {
        data: {
          synced_to_training: true,
          training_id: response.data.documentId || response.data.id,
        },
      });

      return {
        success: true,
        training: response.data,
        durationMinutes,
      };
    } catch (error) {
      console.error("Convert to training error:", error);
      return { success: false, error: error.message };
    }
  }

  async getSyncSettings() {
    try {
      const { data } = await API.get("/health-sync-settings/me");

      if (!data.data) {
        const { data: newSettings } = await API.post("/health-sync-settings", {
          data: {
            apple_health_enabled: Platform.OS === "ios",
            google_fit_enabled: Platform.OS === "android",
            auto_sync_enabled: true,
            steps_threshold: STEPS_THRESHOLD,
          },
        });

        return newSettings.data;
      }

      return data.data;
    } catch (error) {
      console.error("Get sync settings error:", error);
      return null;
    }
  }

  async updateSyncSettings(settings) {
    try {
      const currentSettings = await this.getSyncSettings();

      if (!currentSettings) {
        const { data } = await API.post("/health-sync-settings", {
          data: settings,
        });
        return { success: true, data: data.data };
      }

      const { data } = await API.put(
        `/health-sync-settings/${currentSettings.documentId || currentSettings.id}`,
        {
          data: settings,
        }
      );

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Update sync settings error:", error);
      return { success: false, error: error.message };
    }
  }

  async getRecentSyncSessions(limit = 30) {
    try {
      const { data } = await API.get(
        `/health-sync-sessions?sort=sync_date:desc&pagination[limit]=${limit}`
      );

      return data.data || [];
    } catch (error) {
      console.error("Get recent sessions error:", error);
      return [];
    }
  }
}

export default new HealthSyncService();
