# SES (Startup Ecosystem Support) – Innovation & Ecosystem Management Platform

React Native (Expo) mobile app for a government hackathon. Unites the innovation ecosystem: Startups, Investors, IT Companies.

## Tech stack

- **React Native** + **Expo** (SDK 54)
- **Expo Router** (file-based routing)
- **NativeWind** (Tailwind for RN)
- **SQLite** (Local database for data persistence)
- **Google Gemini API** (AI Chatbot)
- **react-native-maps** (Ecosystem map)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the project root:
   ```bash
   EXPO_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```
   - Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/)
   - Click "Get API key" → "Create API key in new project"
   - Copy the key and paste it in `.env`

3. **Assets** (Optional)
   - Add `assets/icon.png`, `assets/splash-icon.png`, `assets/adaptive-icon.png` (or remove references from `app.json`)

4. **Start the app**
   ```bash
   npx expo start
   ```

## Running the Mobile App

### Via Expo Go (Quickest way)
1. Install the **Expo Go** app on your phone from App Store or Google Play
2. Run: `npx expo start`
3. Scan the QR code with your phone
4. The app opens in Expo Go

### Via Android Emulator
```bash
npx expo start --android
```
Requires Android Studio and emulator setup.

### Via iOS Simulator (Mac only)
```bash
npx expo start --ios
```

### Via Web Browser
```bash
npx expo start --web
```
Runs a web version (limited React Native features).

## Navigation Guide

### Tabs (Bottom Navigation)
The app has 5 main tabs:

1. **Home** – Browse and manage hackathons
   - Lists all available hackathons
   - Tap a hackathon to view details, teams, and "Join Team" option
   - Admin panel accessible from top-right for organizers

2. **Hub** – Browse startup profiles
   - Browse all startup companies in the ecosystem
   - Role-specific titles:
     - Startups: "Hub – Startaplar"
     - Investors: "İnvestisiya Hub – Startaplar"
     - IT Companies: "Hub – Startaplar və tərəfdaşlıq"
   - Tap a startup to view full profile

3. **Chat** – AI Assistant
   - Chatbot powered by Google Gemini
   - Answers ecosystem-related questions
   - Requires EXPO_PUBLIC_GEMINI_API_KEY in `.env`

4. **Map** – Ecosystem Map
   - Blue pins: Hackathons
   - Green pins: IT Hubs
   - Interactive map view

5. **Profile** – User settings and account management

### Key Changes (Latest Update)
- **Startups removed from Home page**: Previously, the Home tab had a toggle between "Hackathons" and "Startups". This has been removed.
- **Startups now only in Hub**: All startup browsing is now centralized in the **Hub** tab
- **Cleaner Home focus**: Home page now dedicated purely to hackathon management and participation
- **SQLite instead of Supabase**: Data is now stored locally using SQLite for better performance and offline capability
- **Google Gemini AI**: ChatBot now uses Google Gemini API instead of OpenAI

## Features

- **Auth & RBAC**: Login/Register with email/password. Six roles: Startup, Investor, IT Company, Incubator, Admin, Super Admin. Stored locally in SQLite.
- **Hackathons**: Browse hackathons with locations, icons, and evaluation system. Jury members can evaluate startups.
- **Startup Evaluations**: Comprehensive evaluation system with scores for innovation, market potential, technical quality, presentation, and business model.
- **Awards**: Track hackathon awards and prizes for winning startups.
- **Home**: Displays list of hackathons only. Tap a hackathon to view details → teams → tap team for members and "Join Team".
- **Hub**: Startup/Investment Hub dedicated for browsing all startup profiles. Centralized access with role-specific messaging.
- **Map**: Ecosystem map with pins for Hackathons (blue) and IT Hubs (green).
- **Chat**: AI chatbot powered by Google Gemini API. Responds to ecosystem-related questions.

## Database

- **SQLite** (`expo-sqlite`): Local data persistence for user profiles, hackathons, startups, and evaluations
- **AsyncStorage**: Small data caching (tokens, preferences)
- No backend server needed – app runs completely offline except for Gemini API calls

## Security

- Passwords are hashed (for production, use bcrypt)
- Comments in `src/services/auth.service.ts` indicate where to add **audit logging** and **data encryption**
- Do not expose the Gemini API key in public repositories; use `.env` file locally
- For production, consider adding backend authentication and token validation

## Project structure

See `docs/FOLDER_STRUCTURE.md` for the recommended folder layout.

## Troubleshooting

### ChatBot not responding?
- Check `.env` file has `EXPO_PUBLIC_GEMINI_API_KEY` set correctly
- Verify API key from [Google AI Studio](https://aistudio.google.com/)
- Check internet connection
- Review error message in console for API quota issues

### App not loading?
- Clear cache: `npx expo start -c`
- Delete `node_modules` and run `npm install` again
- Check that all dependencies are installed

### Data not persisting?
- Ensure SQLite is properly configured in `app.json`
- Check file permissions on device
- Try uninstalling and reinstalling the app
