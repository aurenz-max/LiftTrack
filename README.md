# LiftTrack

A mobile-first workout tracking web app for structured training. Log sets, reps, and weights in real time, track volume and personal records, and review workout history — all with offline support.

## Tech Stack

- **Framework:** React 19 + TypeScript 5.9
- **Build:** Vite 7
- **Styling:** Tailwind CSS 4
- **State:** Zustand (active workout) + TanStack React Query (server state)
- **Backend:** Firebase (Authentication + Firestore)
- **Routing:** React Router 7
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Authentication and Firestore enabled

### Installation

```bash
git clone <repo-url>
cd LiftTrack
npm install
```

### Environment Setup

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Required variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev        # Start dev server
npm run build      # Type-check + production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Features

- **Authentication** — Email/password and Google OAuth sign-in
- **Quick-start workouts** — Pre-built Chest, Back, and Legs templates
- **Live workout logging** — Card-based UI with weight/rep inputs and +/- adjustments
- **Rest timer** — Configurable countdown with sound/vibration alerts
- **Volume tracking** — Real-time per-exercise and total volume calculations
- **Personal records** — Automatic PR detection using estimated 1RM
- **Workout history** — Chronological log with split-type color coding
- **Exercise database** — 100+ exercises searchable by muscle group and equipment
- **Settings** — Unit preference (lb/kg), default rest timer duration
- **Offline support** — IndexedDB persistence for Firestore, localStorage for active workouts

## Project Structure

```
src/
├── config/         Firebase initialization
├── contexts/       React context (AuthContext)
├── services/       Firestore operations, calculation logic
├── stores/         Zustand store (active workout state)
├── hooks/          Custom hooks (exercises, timer)
├── types/          TypeScript type definitions
├── data/           Exercise database, default templates
├── lib/            Utility functions
├── components/
│   ├── layout/     AppShell, BottomNav, Header
│   ├── auth/       ProtectedRoute
│   ├── dashboard/  QuickStartCard, WeeklySummary, ActiveWorkoutBanner
│   ├── workout/    ExerciseCard, SetRow, RestTimerOverlay, AddExerciseSheet
│   └── ui/         Shared UI primitives (shadcn/ui)
├── pages/          Route-level page components
└── App.tsx         Root routing and providers
```

## Pages and Routes

| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Email/password + Google sign-in |
| `/register` | RegisterPage | Account creation |
| `/` | DashboardPage | Quick-start, weekly summary, active workout banner |
| `/workout/:sessionId` | ActiveWorkoutPage | Live workout logging |
| `/workout/:sessionId/summary` | WorkoutSummaryPage | Post-workout stats and PR display |
| `/history` | HistoryPage | Workout log list |
| `/history/:sessionId` | WorkoutDetailPage | Single workout breakdown |
| `/exercises` | ExercisesPage | Searchable exercise database |
| `/settings` | SettingsPage | Units, rest timer, sign out |

## Firebase Documentation

See [FIREBASE.md](FIREBASE.md) for detailed documentation on the database schema, authentication flow, data operations, and how Firebase is used throughout the app.
