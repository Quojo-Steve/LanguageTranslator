const { withAndroidManifest, withInfoPlist } = require("@expo/config-plugins");

const withVoicePlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    const permissions = [
      "android.permission.RECORD_AUDIO",
      "android.permission.INTERNET",
    ];
    if (!androidManifest["uses-permission"]) {
      androidManifest["uses-permission"] = [];
    }
    permissions.forEach((permission) => {
      if (
        !androidManifest["uses-permission"].find(
          (item) => item["$"]["android:name"] === permission
        )
      ) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": permission,
          },
        });
      }
    });
    return config;
  });
};

module.exports = withVoicePlugin;
