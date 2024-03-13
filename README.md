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
