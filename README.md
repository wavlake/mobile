## Getting Started

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npx expo start
```

You may have to use --tunnel flag:

```bash
npx expo start --tunnel
```

## Expo Application Services

https://docs.expo.dev/build/setup/

These are directions to build the app with EAS and then publish to testflight. The first time this process is done, EAS will prompt you for an appstore key file which can be obtained from an admin of the appstore account. This assumes you already have an appstore account that you can login with.

1. Install eas cli tool
   ```bash
   npm install -g expo-cli
   ```
1. After creating an EAS account, login
   ```bash
   eas login
   ```
1. Create a testflight build
   ```bash
   eas build --platform ios --profile testflight
   ```
1. Submit to appstore
   ```bash
   eas submit --platform ios
   ```
