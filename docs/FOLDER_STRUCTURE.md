# RANDOMWARE – Recommended Expo Folder Structure

## Overview

This structure supports **secure auth (RBAC)**, **dashboard/navigation**, **ecosystem map**, and **AI chatbot** with clear separation of concerns and room for encryption/audit hooks.

---

## Root-Level Layout

```
RandomwareApp/
├── app/                          # Expo Router – file-based routes (every file = route)
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main app (authenticated) – bottom tabs
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Home (Programs & Hackathons)
│   │   ├── hub.tsx               # Startup/Investment Hub
│   │   ├── map.tsx               # Ecosystem Map
│   │   └── chat.tsx              # AI Chatbot
│   ├── hackathon/
│   │   └── [id].tsx              # Hackathon details
│   ├── team/
│   │   └── [id].tsx              # Team details (members, Join Team)
│   ├── startup/
│   │   └── [id].tsx              # Startup profile (for investors)
│   ├── _layout.tsx               # Root layout (auth guard, theme)
│   └── index.tsx                 # Entry / redirect (auth check)
├── src/
│   ├── components/               # Reusable UI
│   │   ├── ui/                   # Buttons, inputs, cards (NativeWind)
│   │   ├── auth/                 # 2FA placeholder, Captcha, MyGov button
│   │   ├── map/                  # Map pins, cluster, custom markers
│   │   └── chat/                 # Chat bubbles, input
│   ├── contexts/                 # React context
│   │   ├── AuthContext.tsx       # User, role, session
│   │   └── ThemeContext.tsx      # (optional) theme
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useRole.ts
│   │   └── useSupabase.ts
│   ├── lib/                      # Core config & clients
│   │   ├── supabase.ts           # Supabase client (single source)
│   │   └── openai.ts             # OpenAI client (server/edge preferred)
│   ├── services/                 # API / Supabase logic (secure layer)
│   │   ├── auth.service.ts       # Login, register, 2FA, session
│   │   ├── hackathon.service.ts  # Hackathons, teams, members
│   │   ├── startup.service.ts    # Startup profiles (RBAC-aware)
│   │   ├── map.service.ts        # Hackathon events, IT hubs for map
│   │   └── chat.service.ts       # OpenAI chat (proxy recommended)
│   ├── types/                    # TS types & DB types
│   │   ├── database.types.ts     # Supabase generated types
│   │   └── models.ts            # App models (User, Startup, Hackathon, etc.)
│   ├── constants/                # Roles, config
│   │   ├── roles.ts              # Role slugs and display names
│   │   └── config.ts            # API URLs, feature flags
│   └── utils/                    # Helpers
│       ├── rbac.ts               # Role checks, permission helpers
│       └── validation.ts
├── assets/
│   ├── images/
│   └── fonts/
├── supabase/
│   ├── migrations/               # SQL migrations (schema, RLS, triggers)
│   │   └── 001_initial_schema.sql
│   └── seed.sql                  # (optional) dev seed data
├── docs/
│   └── FOLDER_STRUCTURE.md       # This file
├── app.json
├── package.json
├── tailwind.config.js            # NativeWind
├── tsconfig.json
└── .env.example                  # SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY
```

---

## Notes

- **Auth**: All auth UI and logic live under `app/(auth)/` and `src/services/auth.service.ts`. Placeholders for 2FA, Captcha, and “Login with MyGov” go in `src/components/auth/`.
- **RBAC**: Role stored on profile; `useRole()` and `src/utils/rbac.ts` drive UI and service-level checks. Supabase RLS enforces server-side.
- **Security**: All Supabase access goes through `src/lib/supabase.ts`. Add **data encryption** (e.g. column-level or application-layer) in `services/*` and document **audit logging** points in comments where sensitive operations occur.
- **Maps**: `app/(tabs)/map.tsx` uses `react-native-maps`; pins for hackathons and IT hubs are loaded via `map.service.ts` and rendered in `src/components/map/`.

Once you confirm this structure and the Supabase schema (see `supabase/migrations/001_initial_schema.sql`), the next step is to generate the **Auth screens** and **Bottom Tab Navigator** code.
