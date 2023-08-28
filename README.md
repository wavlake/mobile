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

1. Install eas cli tool
   ```bash
   npm install -g expo-cli
   ```
1. After creating an EAS account, login
   ```bash
   eas login
   ```
1. Create a build
   ```bash
   eas build --platform ios
   ```
1. Submit to appstore
   ```bash
   eas submit --platform ios
   ```
