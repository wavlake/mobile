# Wavlake Mobile App - Context for Claude

## Project Overview

This is the Wavlake mobile application built with React Native and Expo. Wavlake is a music streaming platform that integrates with Nostr (a decentralized social protocol) and Bitcoin Lightning payments.

## Tech Stack

- **Framework**: React Native with Expo (SDK 51)
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode enabled)
- **State Management**: React Query (Tanstack Query)
- **Authentication**: Firebase Auth with email/Google/Apple sign-in + Nostr nsec support
- **Audio**: react-native-track-player
- **Styling**: React Native Elements UI (@rneui)
- **Build System**: EAS (Expo Application Services)

## Key Features

1. Music streaming with Bitcoin Lightning payments
2. Nostr social integration (comments, profiles, activity feeds)
3. User library management (albums, artists, tracks, playlists)
4. Wallet integration with NWC (Nostr Wallet Connect)
5. Deep linking support for iOS and Android
6. Offline support via React Query persistence

## Project Structure

```
mobile/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (drawer)/          # Main app drawer navigation
│   │   └── (tabs)/        # Tab navigation
│   ├── auth/              # Authentication flow screens
│   ├── settings/          # Settings screens
│   ├── wallet/            # Wallet screens
│   └── zap/               # Lightning payment screens
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
│   ├── library/          # Library management hooks
│   ├── nostrProfile/     # Nostr profile hooks
│   └── playlist/         # Playlist management hooks
├── services/             # Service layer (API, music player)
├── utils/                # Utility functions
├── constants/            # App constants
└── providers/            # React context providers
```

## Environment Configuration

The app uses different build profiles defined in `eas.json`:

- **production**: Main production build
- **external**: TestFlight/staging builds
- **internal**: Internal testing
- **development**: Local development with staging APIs

Environment variables:

- `EXPO_PUBLIC_WAVLAKE_API_URL`: Main catalog API
- `EXPO_PUBLIC_WAVLAKE_ACCOUNTING_API_URL`: Accounting/wallet API
- `EXPO_PUBLIC_WALLET_SERVICE_PUBKEY`: Nostr pubkey for wallet service
- `EXPO_PUBLIC_WAVLAKE_FEED_PUBKEY`: Nostr pubkey for Wavlake feed

## Build & Development

### Prerequisites

1. Node.js and npm installed
2. EAS CLI: `npm install -g eas-cli`
3. Device setup with `eas device:create` (required for native audio modules)
4. For iOS: Apple Developer account with device registered
5. Firebase config files:
   - Android: `google-services.json`
   - iOS: `GoogleService-Info.plist`

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# With tunnel (for VPN/network issues)
npx expo start --tunnel

# Build for development
eas build --profile development --platform ios
```

### Deployment

```bash
# Build for TestFlight
eas build --platform ios --profile external

# Submit to App Store
eas submit --platform ios

# Update store metadata
eas metadata:push
```

## Key APIs & Services

1. **Wavlake Catalog API**: Music metadata, search, content
2. **Wavlake Accounting API**: Wallet operations, transactions
3. **Nostr Protocol**: Social features, comments, profiles
4. **Firebase**: User authentication
5. **Sentry**: Error tracking and monitoring

## Important Files

- `app.config.ts`: Expo configuration (version, build settings, plugins)
- `eas.json`: Build profiles and environment configs
- `store.config.json`: App Store metadata
- `app/(drawer)/(tabs)/(home)/index.tsx`: Main home screen
- `components/MusicPlayerProvider.tsx`: Global music player state
- `providers/UserContextProvider.tsx`: User authentication state

## Nostr Integration

The app deeply integrates with Nostr:

- User profiles sync with Nostr
- Comments are Nostr events
- Wallet connections use NWC (Nostr Wallet Connect)
- Activity feeds pull from Nostr relays
- Supports Amber (external Nostr signer) for Android

## Deep Linking

Configured paths that open in the app:

- `/playlist/*`
- `/album/*`
- `/track/*`
- `/verification-link`

Deep link configuration:

- iOS: Uses AASA file hosted at `wavlake.com/.well-known/apple-app-site-association`
- Android: Configured in `app.config.ts` with verification at `wavlake.com/.well-known/assetlinks.json`

## Current Version

- Version: 1.1.5
- Build Number: 1
- iOS Deployment Target: 18.0
- Android Target SDK: 34

## Common Development Tasks

### Adding a new screen

1. Create file in appropriate `app/` directory
2. File name becomes the route (e.g., `app/newscreen.tsx` → `/newscreen`)
3. Use `_layout.tsx` files for nested navigation

### Working with the music player

- Global player state in `MusicPlayerProvider`
- Use `useTrackPlayer` hook from react-native-track-player
- Mini player shown via `MiniMusicPlayerProvider`

### Managing user library

- Hooks in `hooks/library/` for CRUD operations
- Data persisted via React Query + AsyncStorage
- Syncs with backend API

### Nostr operations

- Use hooks in `hooks/nostrProfile/`
- Relay pool managed in `utils/relay-pool.ts`
- Event signing handled by `utils/signing.ts`

## Testing Considerations

- Test deep links on physical devices
- Test wallet operations with testnet
- Verify Nostr event publishing
- Check offline behavior
- Test on both iOS and Android

## Security Notes

- Firebase config files contain secrets (gitignored)
- Nostr private keys stored in secure storage
- NWC connections use encrypted storage
- API calls use auth tokens when available

```

```
