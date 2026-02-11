# Firebase Documentation

This document describes how LiftTrack uses Firebase for authentication, data storage, and offline persistence.

## Overview

LiftTrack uses two Firebase services:

- **Firebase Authentication** — User sign-in (email/password + Google OAuth)
- **Cloud Firestore** — All persistent data (user profiles, workout sessions)

Firebase is initialized in `src/config/firebase.ts`. Credentials are loaded from environment variables prefixed with `VITE_`.

## Firebase Initialization

```
src/config/firebase.ts
```

The app configures two key persistence features at startup:

1. **Auth persistence** — `browserLocalPersistence` keeps the user signed in across browser sessions
2. **Firestore offline cache** — `enableIndexedDbPersistence` caches Firestore data in IndexedDB so the app works offline and syncs when reconnected

## Authentication

```
src/contexts/AuthContext.tsx
```

### Auth Methods

| Method | Firebase API | Description |
|---|---|---|
| Email/password login | `signInWithEmailAndPassword` | Standard email login |
| Email/password register | `createUserWithEmailAndPassword` + `updateProfile` | Creates account, sets display name |
| Google OAuth | `signInWithPopup` + `GoogleAuthProvider` | One-tap Google sign-in |
| Sign out | `signOut` | Clears session and profile state |

### Auth State Flow

1. `onAuthStateChanged` listener fires on every auth state change
2. When a user signs in, the listener fetches their profile from Firestore (`users/{uid}/profile/settings`)
3. The `user` (Firebase Auth object) and `userProfile` (Firestore document) are stored in React context
4. All protected routes check for `user` via `ProtectedRoute` — unauthenticated users are redirected to `/login`

### New User Registration

When a new user registers (email or Google), the app creates a profile document in Firestore:

```typescript
{
  displayName: "User's Name",
  email: "user@example.com",
  photoUrl: "https://...",        // from Google, or undefined
  units: "lb",                    // default
  defaultRestTimer: 90,           // default, in seconds
  createdAt: serverTimestamp()
}
```

For Google sign-in, profile creation only happens on first login (checked via `profileSnap.exists()`).

## Database Schema

All data is stored under a per-user document path. There are no shared or global collections used at runtime.

### Collection Structure

```
Firestore Root
└── users/{userId}/
    ├── profile/
    │   └── settings              ← single document with user preferences
    └── workoutSessions/
        ├── {sessionId}           ← one document per completed workout
        ├── {sessionId}
        └── ...
```

### `users/{userId}/profile/settings`

Stores user preferences. One document per user.

| Field | Type | Description |
|---|---|---|
| `displayName` | `string` | User's display name |
| `email` | `string` | User's email address |
| `photoUrl` | `string?` | Profile photo URL (from Google OAuth) |
| `units` | `"lb" \| "kg"` | Weight unit preference |
| `defaultRestTimer` | `number` | Rest timer duration in seconds (60, 90, 120, or 180) |
| `createdAt` | `Timestamp` | Account creation time (server-generated) |

### `users/{userId}/workoutSessions/{sessionId}`

Stores completed workouts. One document per workout.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Document ID |
| `userId` | `string` | Owner's user ID |
| `templateId` | `string?` | Source template ID (if started from a template) |
| `splitType` | `"chest" \| "back" \| "legs" \| "custom"` | Workout category |
| `name` | `string` | Workout display name (e.g., "Chest Day") |
| `startedAt` | `Timestamp` | When the user started the workout |
| `completedAt` | `Timestamp` | When the workout was finished (server-generated) |
| `duration` | `number?` | Total duration in seconds |
| `totalVolume` | `number` | Sum of all exercise volumes (weight x reps) |
| `notes` | `string?` | User notes |
| `aiCommentary` | `string?` | AI coach commentary (reserved, not yet populated) |
| `exercises` | `WorkoutExercise[]` | Array of exercises performed (see below) |

### `exercises` Array (embedded in each workout session)

Each element in the `exercises` array:

| Field | Type | Description |
|---|---|---|
| `exerciseId` | `string` | Reference to the exercise definition |
| `exerciseName` | `string` | Denormalized name for display without lookups |
| `order` | `number` | Position in the workout (0-indexed) |
| `sets` | `WorkoutSet[]` | Array of sets performed (see below) |
| `volumeTotal` | `number` | Total volume for this exercise |

### `sets` Array (embedded in each exercise)

Each element in the `sets` array:

| Field | Type | Description |
|---|---|---|
| `setNumber` | `number` | Set position (1-indexed) |
| `weight` | `number` | Weight used |
| `reps` | `number` | Reps performed |
| `rpe` | `number?` | Rate of perceived exertion (1-10) |
| `isWarmup` | `boolean` | Whether this was a warmup set (excluded from volume) |
| `isDropset` | `boolean` | Whether this was a drop set |
| `isPR` | `boolean` | Whether this set was a personal record |
| `completed` | `boolean` | Whether the set was actually performed |
| `completedAt` | `Timestamp?` | When the set was completed |

## Firestore Operations

All database operations are centralized in `src/services/firestore.ts`.

### Write Operations

#### `saveWorkoutSession(userId, session)`

Saves a completed workout to Firestore.

- **Path:** `users/{userId}/workoutSessions` (auto-generated ID)
- **When called:** After the user taps "Finish Workout" on the active workout page
- **Key behavior:** Sets `completedAt` to `serverTimestamp()` so the time is determined by the server, not the client
- **Returns:** The auto-generated document ID

#### `updateUserProfile(userId, data)`

Updates user settings (units, rest timer).

- **Path:** `users/{userId}/profile/settings`
- **When called:** From the Settings page when the user changes preferences
- **Uses:** `updateDoc` (partial update, not overwrite)

#### `deleteWorkoutSession(userId, sessionId)`

Removes a workout from history.

- **Path:** `users/{userId}/workoutSessions/{sessionId}`
- **When called:** From the workout detail page via a delete action

### Read Operations

#### `getWorkoutSessions(userId, limitCount)`

Fetches the user's workout history.

- **Path:** `users/{userId}/workoutSessions`
- **Query:** Ordered by `completedAt` descending, limited to `limitCount` (default 50)
- **Used by:** History page, weekly summary on the dashboard

#### `getWorkoutSessionById(userId, sessionId)`

Fetches a single workout by ID.

- **Path:** `users/{userId}/workoutSessions/{sessionId}`
- **Used by:** Workout detail page, workout summary page

#### `getLastWorkoutByType(userId, splitType)`

Fetches the most recent workout of a given split type.

- **Path:** `users/{userId}/workoutSessions`
- **Query:** Filtered by `splitType`, ordered by `completedAt` descending, limited to 1
- **Used by:** Active workout page to pre-fill weights from the last session

#### `getExerciseHistory(userId, exerciseId, limitCount)`

Fetches historical data for a specific exercise across all workouts.

- **Path:** `users/{userId}/workoutSessions`
- **Approach:** Fetches up to 100 recent sessions, then filters client-side for the target exercise
- **Used by:** PR detection logic
- **Note:** This is a client-side filter because Firestore can't query into nested arrays. Consider a denormalized subcollection if workout count grows large.

## Required Firestore Indexes

These composite indexes need to be created in the Firebase Console (or via `firestore.indexes.json`):

| Collection | Fields | Purpose |
|---|---|---|
| `users/{userId}/workoutSessions` | `completedAt` DESC | List all workouts by date |
| `users/{userId}/workoutSessions` | `splitType` ASC, `completedAt` DESC | Get last workout by split type |

## Data Flow Diagrams

### Starting and Completing a Workout

```
User taps "Start Chest Day"
        │
        ▼
┌─────────────────────┐
│  Zustand Store      │  ← Workout state lives in memory + localStorage
│  (workoutStore.ts)  │
└────────┬────────────┘
         │  User logs sets, adjusts weight/reps
         │
         ▼
┌─────────────────────┐
│  localStorage       │  ← Persisted via Zustand middleware
│  (lifttrack-workout)│     Survives page refresh / accidental close
└────────┬────────────┘
         │  User taps "Finish Workout"
         │
         ▼
┌─────────────────────┐
│  saveWorkoutSession  │  ← Writes to Firestore
│  (firestore.ts)     │     completedAt = serverTimestamp()
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Firestore          │
│  users/{uid}/       │
│  workoutSessions/   │
│  {auto-id}          │
└─────────────────────┘
         │
         ▼
   Zustand store cleared
   User redirected to summary
```

### Authentication Flow

```
User opens app
       │
       ▼
onAuthStateChanged listener
       │
       ├── User signed in ──► Fetch profile from Firestore
       │                       └── Set user + userProfile in context
       │
       └── No user ──────────► Redirect to /login
                                    │
                              ┌─────┴─────┐
                              │            │
                          Email login  Google login
                              │            │
                              ▼            ▼
                        signInWith...  signInWithPopup
                              │            │
                              │     First time?
                              │      ├── Yes ──► createUserProfile()
                              │      └── No ───► (profile already exists)
                              │            │
                              └──────┬─────┘
                                     ▼
                           onAuthStateChanged fires
                           Profile fetched from Firestore
                           App renders dashboard
```

## Offline Support

LiftTrack has two layers of offline resilience:

1. **Active workout (Zustand + localStorage)**
   - The in-progress workout is stored in the Zustand store with `persist` middleware
   - Key: `lifttrack-workout` in localStorage
   - This means if the user closes the tab mid-workout, the workout is recovered on next visit
   - The `ActiveWorkoutBanner` on the dashboard detects this and offers to resume

2. **Firestore (IndexedDB cache)**
   - `enableIndexedDbPersistence` caches all Firestore reads locally
   - If the user goes offline, reads are served from cache
   - Writes are queued and synced when connectivity returns
   - Limitation: Only works in a single tab (multi-tab shows a console warning)

## Security Considerations

- All Firestore queries are scoped to the authenticated user via `users/{userId}/...` paths
- The `userId` parameter in all service functions comes from `auth.currentUser.uid`
- Firestore security rules should enforce that users can only read/write their own data:

```
// Recommended Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

- Firebase config values (API key, project ID) are safe to expose in client-side code — Firebase security rules and Auth are what protect data access
- The `.env` file should be listed in `.gitignore` to avoid committing credentials to version control
