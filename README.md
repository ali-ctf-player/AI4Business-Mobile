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

## Features

- **Auth & RBAC**: Login/Register with placeholders for 2FA, Captcha, “Login with MyGov”. Six roles: Startup, Investor, IT Company, Incubator, Admin, Super Admin.
- **Hackathons**: Manage hackathons with locations, icons, and evaluation system. Jury members can evaluate startups based on multiple criteria.
- **Startup Evaluations**: Comprehensive evaluation system with scores for innovation, market potential, technical quality, presentation, and business model.
- **Awards**: Track hackathon awards and prizes for winning startups.
- **Home**: List of hackathons → tap for details → teams → tap team for members and “Join Team”.
- **Hub**: Startup/Investment Hub (list of startups by ID; visible to Investor, Incubator, Super Admin).
- **Map**: Ecosystem map with pins for Hackathons (blue) and IT Hubs (green).
- **Chat**: AI chatbot (system prompt: national innovation ecosystem assistant). Configure OpenAI via backend proxy for production.

## Security

- All Supabase access uses the single client in `src/lib/supabase.ts`; RLS enforces server-side RBAC.
- Comments in `src/services/auth.service.ts` indicate where to add **audit logging** and **data encryption** for sensitive operations.
- Do not expose the OpenAI API key in the client; use a Supabase Edge Function or your own API for the chatbot.

## Project structure

See `docs/FOLDER_STRUCTURE.md` for the recommended folder layout.
