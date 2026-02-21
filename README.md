# SES (Startup Ecosystem Support) – Innovation & Ecosystem Management Platform

React Native (Expo) mobile app for a government hackathon. Unites the innovation ecosystem: Startups, Investors, IT Companies.

## Tech stack

- **React Native** + **Expo** (SDK 51)
- **Expo Router** (file-based routing)
- **NativeWind** (Tailwind for RN)
- **Supabase** (Auth + Database, RBAC via RLS)
- **OpenAI API** (Chatbot – use backend proxy in production)
- **react-native-maps** (Ecosystem map)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (create a project at [supabase.com](https://supabase.com))
   - Run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor

3. **Assets**
   - Add `assets/icon.png`, `assets/splash-icon.png`, `assets/adaptive-icon.png` (or remove references from `app.json`)

4. **Start**
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
   - Chatbot for ecosystem questions
   - Trained as a national innovation ecosystem assistant

4. **Map** – Ecosystem Map
   - Blue pins: Hackathons
   - Green pins: IT Hubs
   - Interactive map view

5. **Profile** – User settings and account management

### Key Changes (Latest Update)
- **Startups removed from Home page**: Previously, the Home tab had a toggle between "Hackathons" and "Startups". This has been removed.
- **Startups now only in Hub**: All startup browsing is now centralized in the **Hub** tab
- **Cleaner Home focus**: Home page now dedicated purely to hackathon management and participation

## Features

- **Auth & RBAC**: Login/Register with placeholders for 2FA, Captcha, "Login with MyGov". Six roles: Startup, Investor, IT Company, Incubator, Admin, Super Admin.
- **Hackathons**: Manage hackathons with locations, icons, and evaluation system. Jury members can evaluate startups based on multiple criteria.
- **Startup Evaluations**: Comprehensive evaluation system with scores for innovation, market potential, technical quality, presentation, and business model.
- **Awards**: Track hackathon awards and prizes for winning startups.
- **Home**: Displays list of hackathons only. Tap a hackathon to view details → teams → tap team for members and "Join Team".
- **Hub**: Startup/Investment Hub dedicated for browsing all startup profiles. Centralized access with role-specific messaging.
- **Map**: Ecosystem map with pins for Hackathons (blue) and IT Hubs (green).
- **Chat**: AI chatbot (system prompt: national innovation ecosystem assistant). Configure OpenAI via backend proxy for production.

## Security

- All Supabase access uses the single client in `src/lib/supabase.ts`; RLS enforces server-side RBAC.
- Comments in `src/services/auth.service.ts` indicate where to add **audit logging** and **data encryption** for sensitive operations.
- Do not expose the OpenAI API key in the client; use a Supabase Edge Function or your own API for the chatbot.

## Project structure

See `docs/FOLDER_STRUCTURE.md` for the recommended folder layout.
