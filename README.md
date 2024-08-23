## Getting Started

You will need to set up your local environment/device using `eas device:create`. This is because the audio library we are using requires some native modules that must be built separately from the React app itself. If developing on iOS, this setup process might also require you have an Apple Developer account with the device(s) you are developing on registered to that account. More details [here](https://docs.expo.dev/eas-update/expo-dev-client/).

Once you have your device set up and have a pre-build of the app (see Local Development section below)...

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npx expo start
```

You may have to use `--tunnel` flag for some local network/VPN setups:

```bash
npx expo start --tunnel
```

## Expo Application Services

https://docs.expo.dev/build/setup/

### Local Development (Pre-build Native Modules)

To push a build to Expo using the development profile:

```bash
eas build --profile development --platform ios
```

or with

```bash
eas build -p ios --non-interactive --profile external
```

[More info](https://docs.expo.dev/develop/development-builds/create-a-build/)

### TestFlight

These are directions to build the app with EAS and then publish to testflight. The first time this process is done, EAS will prompt you for an appstore key file which can be obtained from an admin of the appstore account. This assumes you already have an appstore account that you can login with.

1. Install eas cli tool
   ```bash
   npm install -g expo-cli
   ```
2. After creating an EAS account, login
   ```bash
   eas login
   ```
3. Create a testflight build (once an appstore connect key is set, you can auto submit by adding this flag `--auto-submit`)
   ```bash
   eas build --platform ios --profile external
   ```
4. Submit to appstore
   ```bash
   eas submit --platform ios
   ```

The app store metadata is saved within the `store.config.json` file. If this file is changed, you will need to push the updates to the app store using `eas metadata:push`

An important thing to remember from the above example is the configVersion property. It helps with versioning changes that are not backward compatible.

## Deep links

### iOS

Deep links are links that will open up in the mobile app instead of the browser. These links are defined in the apple-app-site-association (AASA) file, which is hosted on the main wavlake.com website, `public/.well-known/apple-app-site-association`.

The following is the process for adding/removing/editing which paths will open in the app and which will not:

1. Update the AASA file hosted at `wavlake.com/.well-known/apple-app-site-association`.
1. Update the [DeepLinkHandler](components/DeepLinkHandler.tsx) component (if needed). This is responsible for auto-redirecting the user to the proper page in the app.
1. Generate a new build for the iOS app.
1. Install the new build (or push the update to the app store). This will trigger the app to re-fetch the updated AASA file.

### Android

https://developer.android.com/training/app-links/verify-android-applinks#web-assoc

Deep links for Android function similarly to iOS. The Android links are defined within the mobile app, but there is a verification file hosted on the main wavlake.com website, `public/.well-known/assetlinks.json`. This file contains the signature(s) of the Android app builds that utilize the deep links.

**New Android Builds must have their new signature added to the assetlinks.json file!**

1. Obtain a build's signature
   - After installing a development build, execute this adb command:
   ```
   adb shell pm get-app-links com.wavlake.mobile
   ```
   - Or, run `eas credentials` and select a build profile
1. For production builds, navigate to the [Play Console](https://play.google.com/console/) and visit `Release > Setup > App signing`.

The following is the process for adding/removing/editing with paths will open in the app and which will not:

1. Modify the mobile app's `app.json` file to include the linking changes.
   e.g.
   ```
   {
      "scheme": "https",
      "host": "*.wavlake.com",
      "pathPrefix": "/playlist/"
   }
   ```
1. Generate a new development build so you can test the change.
1. Obtain the new build signature (see above for details) and add to the file hosted at `wavlake.com/.well-known/assetlinks.json`.

## Firebase

This app uses Firebase to authenticate users. The app is not totally dependent on Firebase, a user can still login as a read only account to look around, or with just an nsec.

However, if you are trying to run this app locally, you will need to setup a firebase account, generate the missing files, and place them in the root directory so that you can produce a build for Android and/or iOS

- Android https://firebase.google.com/docs/android/setup will produce `google-services.json`
- iOS https://firebase.google.com/docs/ios/setup will produce `GoogleService-Info.plist`

Alternatively, you can modify the build process to not depend on firebase. You will also need to modify the login page and any other firebase dependent features in the app.

Additional reading - https://rnfirebase.io/#configure-react-native-firebase-modules
