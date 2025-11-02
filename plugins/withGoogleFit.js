const { withAndroidStrings } = require("@expo/config-plugins");

/**
 * Plugin Expo pour configurer Google Fit avec le Client ID OAuth
 * Ajoute le Client ID dans android/app/src/main/res/values/strings.xml
 */
const withGoogleFit = (config, { androidClientId }) => {
  if (!androidClientId) {
    throw new Error("withGoogleFit: androidClientId is required");
  }

  // Ajouter le Client ID dans les strings.xml Android
  config = withAndroidStrings(config, (config) => {
    config.modResults = config.modResults || [];
    config.modResults.push({
      $: {
        name: "google_fit_client_id",
      },
      _: androidClientId,
    });
    return config;
  });

  return config;
};

module.exports = withGoogleFit;
