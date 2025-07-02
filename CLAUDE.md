# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wavlake is a React Native mobile app built with Expo that provides music streaming with integrated Bitcoin Lightning payments. The app uses Nostr protocol for social features and enables direct artist payments through the Lightning Network.

## Key Technologies

- **Framework**: React Native with Expo SDK 51
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript with strict mode
- **State Management**: React Query (TanStack Query) with persistence
- **Authentication**: Firebase Auth (email/password, Google, Apple)
- **Audio Playback**: react-native-track-player
- **Bitcoin/Lightning**: Nostr Wallet Connect (NWC) integration
- **Social Protocol**: Nostr for comments, profiles, and social interactions

## Development Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android

# Start with tunnel (useful for VPN/network issues)
npm run dev

# Code quality
npm run format    # Run Prettier
npm run lint      # Run ESLint

# Build commands (requires EAS CLI)
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Architecture Overview

### Navigation Structure
The app uses Expo Router with nested navigation:
- `(drawer)` - Main drawer navigation
  - `(tabs)` - Bottom tab navigation
    - `(home)` - Home tab with nested screens
    - `earn`, `library`, `profile`, `pulse`, `radio`, `search` - Other main tabs
- `auth/` - Authentication flow screens
- `wallet/` - Bitcoin wallet features
- `zap/` - Lightning payment flows

### State Management Pattern
- **React Query** for server state and caching
- **React Context** for global app state (UserProvider, MusicPlayerProvider)
- **Persistent queries** stored in AsyncStorage
- **Nostr events** handled through dedicated hooks

### Key Service Layers
- `/services/authService.ts` - Firebase authentication
- `/services/trackPlayer/` - Audio playback management
- `/utils/nostr/` - Nostr protocol utilities
- `/utils/nwc.ts` - Nostr Wallet Connect integration

## Important Implementation Details

### Audio Playback
The app uses react-native-track-player for background audio. Key files:
- `/services/trackPlayer/service.ts` - Background service
- `/services/trackPlayer/trackQueue.ts` - Queue management
- `/hooks/usePlayback.ts` - Main playback control hook

### Lightning Payments
Zapping (tipping) artists is core functionality:
- `/app/zap/` - Zap flow screens
- `/utils/nwc.ts` - Wallet connection logic
- `/hooks/useZap.ts` - Zap transaction hook

### Nostr Integration
Social features use Nostr protocol:
- `/utils/nostr/` - Protocol implementation
- `/hooks/useProfile.ts` - User profile management
- `/hooks/useNostrProfileEvent.ts` - Profile event handling
- Supports external signers like Amber app

## Setup Requirements

1. **Firebase Configuration**
   - Add `google-services.json` to `/android/app/`
   - Add `GoogleService-Info.plist` to `/ios/`

2. **Environment Variables**
   Set in Expo configuration or locally:
   - API endpoints are configured per build profile in `eas.json`

3. **Native Development**
   For audio features, use development builds:
   ```bash
   npx expo run:ios
   npx expo run:android
   ```

## Common Tasks

### Adding a New Screen
1. Create file in appropriate route directory under `/app`
2. Export default React component
3. File path becomes the route (e.g., `/app/artist/[artistId].tsx` → `/artist/123`)

### Working with Audio Player
```typescript
import { usePlayback } from '@/hooks/usePlayback';
const { play, pause, skip } = usePlayback();
```

### Implementing Zaps
```typescript
import { useZap } from '@/hooks/useZap';
const { zap } = useZap();
await zap({ amount, comment, recipientPubkey });
```

### Fetching Data
Use React Query hooks:
```typescript
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/services/api';
```

## Testing Approach

Currently no automated tests. When implementing:
- Use React Native Testing Library for components
- Mock react-native-track-player for audio tests
- Mock Firebase for auth tests
- Test Nostr utilities with unit tests

## Build Profiles

- **production**: App store releases
- **external**: TestFlight/beta testing
- **internal**: Internal testing with production API
- **development**: Debug builds with development API
- **development-simulator**: iOS simulator builds

## Security Considerations

- **Nostr Keys**: User's nsec stored securely, never exposed
- **Firebase**: Handles authentication tokens
- **Deep Links**: Validated before navigation
- **Wallet Connections**: NWC uses encrypted connections