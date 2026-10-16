# Sophia Central Mobile

Sophia Central Mobile is the mobile client repository for the Sophia Central platform. Built with React Native and Expo, it provides the foundation for mobile screen flows, navigation, API integration, and upload-related client logic.

This repository is structured as a mobile application scaffold and includes the main navigation, API utilities, and a set of modular screens that support app functionality and integration with a backend service.

## Product overview

The app currently includes:
- Expo-based React Native setup
- Navigation for authentication and application screens
- API utilities for client requests and token refresh handling
- Upload-related configuration and chunking helpers
- Screen modules for authentication, resource discovery, detail views, and upload actions
- A draft OpenAPI contract for mobile-facing endpoints

## Project structure

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
├── LICENSE
├── openapi.yaml
├── package.json
├── tsconfig.json
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
├── .gitignore
└── .env.example
```

## Key modules

### Application shell
- `App.tsx` sets up the main React Native app container and renders the navigation root.

### Navigation
- `src/navigation/AppNavigator.tsx` defines the app navigation structure, including stack and tab flows.

### API integration
- `src/api/client.ts` contains the Axios client with request and response interceptors for authentication and token refresh.
- `src/api/api.ts` exposes helper methods for resource creation, upload-related requests, and auth actions.

### Upload support
- `src/config/uploadConfig.ts` stores upload thresholds, retry values, and related configuration.
- `src/utils/chunk.ts` provides chunk splitting logic for upload processing.

### Screens
- `src/screens/LoginScreen.tsx` handles the sign-in flow.
- `src/screens/RegisterScreen.tsx` provides account creation UI.
- `src/screens/HomeScreen.tsx` loads a list of resources.
- `src/screens/SearchScreen.tsx` offers a simple search interface.
- `src/screens/UploadScreen.tsx` contains the upload flow entry point.
- `src/screens/ProfileScreen.tsx` exposes account/profile actions.
- `src/screens/ResourceDetailScreen.tsx` displays a selected resource detail view.

### Contract and config reference
- `openapi.yaml` is a draft OpenAPI document for API interactions relevant to the app.
- `app.json` contains Expo configuration.
- `.env.example` provides sample environment values.

## Getting started

### Prerequisites
- Node.js 18 or newer
- npm
- Expo CLI (optional, but commonly used during local development)
- A backend service exposing the endpoints used by the app

### Installation

```bash
npm install
```

### Run locally

```bash
npm run start
```

This starts the Expo development server. From there, you can run the app in the simulator or on a connected device using the standard Expo workflow.

### Useful commands

```bash
npm run web
npm run android
npm run ios
npm run lint
```

## Configuration

The project includes a sample environment file at `.env.example`:

```env
API_URL=https://api.sophia-central.com
APP_VERSION=0.1.0
```

The app may also read values from `app.json` under `expo.extra` depending on the runtime setup.

## Notes

This repository is a working mobile app foundation, but it should be treated as a scaffold and integration layer rather than a fully production-hardened application. Some screens and behaviors are present in a structured form and may require validation against the backend service and the actual product requirements before production use.

## License

This project is licensed under the MIT License. See `LICENSE` for more information.
