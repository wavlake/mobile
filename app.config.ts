// these are references to firebase config files (that contain secrets) that live in the EAS build environment

import { ExpoConfig, ConfigContext } from "expo/config";

export const BUILD_NUM = 1;
export const VERSION = "1.1.1";
export const getUserAgent = (modelName: string = "mobile") =>
  `Wavlake/${VERSION} ${modelName}/${BUILD_NUM} https://wavlake.com`;
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "Wavlake",
    slug: "mobile",
    version: VERSION,
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: ["wavlake", "nostr+walletconnect"],
    userInterfaceStyle: "dark",
    backgroundColor: "#000000",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    assetBundlePatterns: ["**/*"],
    android: {
      package: "com.wavlake.mobile",
      versionCode: BUILD_NUM,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        monochromeImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000",
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "*.wavlake.com",
              pathPrefix: "/playlist/",
            },
            {
              scheme: "https",
              host: "*.wavlake.com",
              pathPrefix: "/album/",
            },
            {
              scheme: "https",
              host: "*.wavlake.com",
              pathPrefix: "/verification-link",
            },
            {
              scheme: "https",
              host: "*.wavlake.com",
              pathPrefix: "/track/",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      googleServicesFile:
        process.env.ANDROID_FILE_SECRET ?? "./google-services.json",
    },
    ios: {
      supportsTablet: true,
      usesAppleSignIn: true,
      infoPlist: {
        UIBackgroundModes: ["audio"],
        NSLocationWhenInUseUsageDescription:
          "This app does not use or store your location data. Location is not required.",
      },
      buildNumber: BUILD_NUM.toString(),
      bundleIdentifier: "com.wavlake.mobile",
      config: {
        usesNonExemptEncryption: false,
      },
      associatedDomains: ["applinks:www.wavlake.com", "applinks:wavlake.com"],
      googleServicesFile:
        process.env.IOS_FILE_SECRET ?? "./GoogleService-Info.plist",
    },
    plugins: [
      "expo-router",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-google-signin/google-signin",
      "expo-font",
      "expo-secure-store",
      "expo-apple-authentication",
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow $(PRODUCT_NAME) to use your camera to scan QR codes for wallet connections.",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            // "deploymentTarget": "17.0"
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you choose a profile picture.",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "mobile",
          organization: "wavlake",
        },
      ],
    ],
    experiments: {
      tsconfigPaths: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "4e7134dc-ace8-44ff-96ee-625eebfc4d7c",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/4e7134dc-ace8-44ff-96ee-625eebfc4d7c",
    },
    owner: "wavlake",
  };
};
