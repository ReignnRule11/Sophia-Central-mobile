# Sophia Central Mobile

Sophia Central Mobile is an Expo-based React Native application scaffold for the Sophia Central platform. The repository currently contains the mobile app shell, navigation structure, API client utilities, upload-related configuration, and a set of screen modules that provide the foundation for a mobile client.

This README reflects the repository as it exists today and avoids describing features that are not clearly implemented in the codebase.

## Overview

The project includes:
- Expo + React Native app setup
- React Navigation structure with authentication and main app flows
- API client with token handling and refresh logic
- Upload configuration and helper utilities
- Screen modules for login, registration, home, search, upload, profile, and resource details
- OpenAPI contract draft for API interaction patterns

## Repository structure

```text
.
├── .env.example
├── .github/
│   └── workflows/
│       └── push-mobile-updates.yml
├── App.tsx
├── README.md
├── app.json
├── jest.config.js
├── openapi.yaml
├── package.json
├── src/
│   ├── __tests__/
│   │   └── chunk.test.ts
│   ├── api/
│   │   ├── api.ts
│   │   └── client.ts
│   ├── components/
│   ├── config/
│   │   └── uploadConfig.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ResourceDetailScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── UploadScreen.tsx
│   └── utils/
│       └── chunk.ts
├── tsconfig.json
├── LICENSE
└── .gitignore
```

## Key application files

### App bootstrap
- `App.tsx` wraps the app in `NavigationContainer` and renders the navigation root.

### Navigation
- `src/navigation/AppNavigator.tsx` defines the app navigation stack and bottom tab structure.

### API layer
- `src/api/client.ts` creates the Axios client and adds request/response interceptors for auth token handling and refresh logic.
- `src/api/api.ts` exposes helper methods for resource creation, upload flow calls, and auth-related requests.

### Upload utilities
- `src/config/uploadConfig.ts` stores upload thresholds and retry settings.
- `src/utils/chunk.ts` contains chunk-splitting logic for upload processing.

### Screens
- `src/screens/LoginScreen.tsx` and `RegisterScreen.tsx` provide auth UI placeholders and requests.
- `src/screens/HomeScreen.tsx` loads resource listings.
- `src/screens/SearchScreen.tsx` offers a simple search UI.
- `src/screens/UploadScreen.tsx` contains the upload workflow entry point.
- `src/screens/ProfileScreen.tsx` displays profile and logout actions.
- `src/screens/ResourceDetailScreen.tsx` shows detail data for a selected resource.

### API contract reference
- `openapi.yaml` contains a draft OpenAPI document describing some mobile-facing endpoints and upload-related flows.

## Getting started

### Prerequisites
- Node.js 18 or newer
- npm
- Expo CLI (optional, but commonly used for local development)
- A backend service that exposes the endpoints used by the app

### Install dependencies

```bash
npm install
```

### Start the app

```bash
npm run start
```

This starts the Expo development server. You can then run the app on a simulator or device using the usual Expo workflows.

### Common development commands

```bash
npm run web
npm run android
npm run ios
npm run lint
```

## Environment and configuration

The project includes `.env.example`, which contains example values for application configuration:

```env
API_URL=https://api.sophia-central.com
APP_VERSION=0.1.0
```

Runtime configuration can also be supplied via `app.json` under `expo.extra`.

## Notes

- The repository includes a basic mobile app scaffold and supporting utilities, but not every screen or integration is necessarily complete or production-ready.
- Some behavior is structured around backend endpoints defined or referenced in `openapi.yaml` and the API helper files.
- The app currently includes placeholder or scaffold-level implementations in several places; these should be validated against the actual backend contract before use in production.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
