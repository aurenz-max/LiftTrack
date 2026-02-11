# LiftTrack - Product Requirements Document

## 1. Overview

**LiftTrack** is a web-based workout tracking application built for serious lifters who want to log, analyze, and improve their training. It organizes workouts around structured training splits (Chest Day, Back Day, Leg Day), provides a searchable exercise database, tracks sets/reps/weights with volume calculations, visualizes performance over time, and integrates Gemini LLM for AI-powered coaching commentary and workout recommendations.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18+ with TypeScript, Vite |
| Styling | Tailwind CSS + shadcn/ui components |
| State | Zustand (local) + TanStack Query (server) |
| Backend/DB | Firebase Firestore |
| Auth | Firebase Authentication (Google, Email/Password) |
| Charts | Recharts |
| AI | Google Gemini API (gemini-2.0-flash) |
| Hosting | Firebase Hosting |

---

## 2. User Personas

| Persona | Description |
|---|---|
| **Consistent Lifter** | Trains 3-6x/week on a push/pull/legs or chest/back/legs split. Wants fast logging during sets and historical tracking. |
| **Progressing Beginner** | Needs exercise guidance, wants to see if they're getting stronger, benefits from AI suggestions. |
| **Data-Driven Athlete** | Wants graphs, volume trends, adherence stats, and exportable data. |

---

## 3. Information Architecture

```
LiftTrack
├── Auth (Login / Register / Password Reset)
├── Dashboard (Home)
│   ├── Quick-Start Workout (Chest / Back / Leg / Custom)
│   ├── Weekly Summary Card
│   ├── Streak & Adherence Widget
│   └── AI Insight of the Day
├── Active Workout (in-session experience)
│   ├── Exercise Queue
│   ├── Set Logger (reps, weight, RPE)
│   ├── Rest Timer
│   ├── Last Workout Reference Panel
│   └── Live Volume Tracker
├── History
│   ├── Calendar View
│   ├── Workout Detail View
│   └── Exercise-Specific History
├── Exercises (Database)
│   ├── Search & Filter (muscle group, equipment, name)
│   ├── Exercise Detail (description, muscles, demo)
│   └── Personal Records per Exercise
├── Analytics
│   ├── Volume Over Time (per muscle group)
│   ├── Strength Progression (per exercise)
│   ├── Workout Frequency & Adherence
│   ├── Body Part Balance Radar Chart
│   └── AI Performance Commentary
├── AI Coach
│   ├── Gemini Recommended Workout
│   ├── Post-Workout Summary & Commentary
│   └── Plateau Detection & Suggestions
└── Settings
    ├── Profile & Units (kg/lb)
    ├── Default Rest Timer Duration
    ├── Training Split Configuration
    └── Data Export (JSON/CSV)
```

---

## 4. Core Features

### 4.1 Authentication

| Requirement | Detail |
|---|---|
| Providers | Google OAuth + Email/Password |
| Session | Firebase Auth persistent session (`browserLocalPersistence`) |
| Protected Routes | All routes except `/login` and `/register` require auth |
| Profile | Display name, avatar (from Google or initials), preferred units |

### 4.2 Training Splits & Workout Templates

Users organize training around **split days**. The app ships with three default splits and supports custom ones.

**Default Splits:**

| Split | Default Exercises |
|---|---|
| **Chest Day** | Flat Bench Press, Incline Dumbbell Press, Cable Flyes, Dips, Pec Deck |
| **Back Day** | Barbell Row, Pull-ups, Seated Cable Row, Lat Pulldown, Face Pulls |
| **Leg Day** | Barbell Squat, Romanian Deadlift, Leg Press, Leg Curl, Calf Raises |

**Template Data Model:**
```typescript
interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;                    // "Chest Day"
  splitType: "chest" | "back" | "legs" | "custom";
  exercises: TemplateExercise[];   // ordered list
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TemplateExercise {
  exerciseId: string;              // reference to exercise DB
  order: number;
  defaultSets: number;            // e.g., 4
  defaultReps: number;            // e.g., 10
  notes?: string;
}
```

### 4.3 Exercise Database

A searchable, filterable database of exercises seeded with 100+ common movements.

**Exercise Data Model:**
```typescript
interface Exercise {
  id: string;
  name: string;                        // "Barbell Bench Press"
  aliases: string[];                   // ["Flat Bench", "Bench Press"]
  primaryMuscles: MuscleGroup[];       // ["chest"]
  secondaryMuscles: MuscleGroup[];     // ["triceps", "front_delts"]
  equipment: Equipment;                // "barbell"
  category: ExerciseCategory;          // "compound"
  instructions?: string;
  imageUrl?: string;
  isCustom: boolean;                   // user-created exercises
  createdBy?: string;                  // userId if custom
}

type MuscleGroup =
  | "chest" | "upper_back" | "lats" | "traps"
  | "front_delts" | "side_delts" | "rear_delts"
  | "biceps" | "triceps" | "forearms"
  | "quads" | "hamstrings" | "glutes" | "calves"
  | "abs" | "obliques" | "lower_back";

type Equipment =
  | "barbell" | "dumbbell" | "cable" | "machine"
  | "bodyweight" | "kettlebell" | "bands" | "other";

type ExerciseCategory = "compound" | "isolation" | "cardio" | "stretch";
```

**Search Features:**
- Instant fuzzy search by name or alias
- Filter by muscle group (multi-select)
- Filter by equipment type
- Filter by category (compound/isolation)
- "Recently used" section pinned at top
- Custom exercise creation with muscle group tagging

### 4.4 Active Workout Experience (Core UX)

This is the heart of the app. The in-workout UI must be **fast, thumb-friendly, and distraction-free**.

#### 4.4.1 Starting a Workout
- Tap a split (Chest / Back / Legs) from the dashboard
- Template exercises pre-load with last-used weights
- Optional: start an empty workout and add exercises ad-hoc

#### 4.4.2 Set Logger UI

The set logger is a **card-based interface** — one exercise visible at a time, swipe or tap to navigate.

```
┌─────────────────────────────────┐
│  Barbell Bench Press        2/5 │  ← exercise name + position
│  Last: 185lb × 8, 8, 7, 6      │  ← last workout reference
├─────────────────────────────────┤
│                                 │
│  Set 1   ✅  185 lb  ×  8 reps │  ← completed set (tappable)
│  Set 2   ✅  185 lb  ×  8 reps │
│  Set 3   ⬜  [185]lb  × [8]reps│  ← active set (editable)
│  Set 4   ⬜   ---  lb  × -- reps│  ← upcoming set (pre-filled)
│                                 │
│  [ + Add Set ]                  │
├─────────────────────────────────┤
│  Volume: 2,960 lb  │  PR? 🔥   │  ← running exercise volume
├─────────────────────────────────┤
│        ⏱️ Rest: 1:32 / 2:00     │  ← auto-starts on set complete
│  [Complete Exercise →]          │
└─────────────────────────────────┘
```

**Set Logger Interactions:**
- **Pre-fill**: Each set pre-fills with last workout's weight/reps for that set
- **Quick Adjust**: +/- buttons for weight (5lb increments) and reps (1 increment)
- **Number Pad**: Tap weight or reps field to open a large numeric input
- **Complete Set**: Tap checkbox → set locks, rest timer auto-starts
- **Swipe Navigation**: Swipe left/right between exercises
- **Reorder**: Long-press to drag exercises into new order
- **Add Exercise**: FAB or bottom button to search and add mid-workout

#### 4.4.3 Rest Timer
- Auto-starts when a set is marked complete
- Configurable default (60s, 90s, 120s, 180s) per exercise or globally
- Visual countdown ring + vibration/sound alert at completion
- Can be dismissed, paused, or adjusted during countdown
- Subtle — should not block the UI

#### 4.4.4 Last Workout Reference
- Always visible for the current exercise
- Shows date, sets × reps × weight from the most recent session
- Highlight if the current set **exceeds** the prior performance (PR indicator)
- Accessible as a slide-up panel with full prior workout detail

#### 4.4.5 Live Volume Tracking
- **Per-exercise volume**: sets × reps × weight (displayed on each exercise card)
- **Per-workout total volume**: running sum displayed in a sticky header/footer
- **Per-muscle-group volume**: aggregated using exercise muscle mappings

#### 4.4.6 Finishing a Workout
- "Finish Workout" button → confirmation modal
- Summary screen shows:
  - Duration
  - Total volume
  - Number of sets completed
  - PRs hit
  - Comparison vs. last similar workout
- Triggers Gemini post-workout commentary (async)

**Workout Session Data Model:**
```typescript
interface WorkoutSession {
  id: string;
  userId: string;
  templateId?: string;
  splitType: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  duration?: number;               // seconds
  totalVolume: number;             // lbs or kg
  exercises: WorkoutExercise[];
  notes?: string;
  aiCommentary?: string;           // populated async by Gemini
}

interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;            // denormalized for fast reads
  order: number;
  sets: WorkoutSet[];
  volumeTotal: number;
}

interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;                    // rate of perceived exertion (1-10)
  isWarmup: boolean;
  isDropset: boolean;
  isPR: boolean;                   // auto-calculated
  completedAt?: Timestamp;
}
```

### 4.5 History & Workout Log

| View | Description |
|---|---|
| **Calendar** | Month view with colored dots per day (color = split type). Tap a day → see workout(s). |
| **List** | Reverse-chronological feed of all workouts. Shows split type, duration, volume, exercise count. |
| **Exercise History** | From any exercise detail page: see every recorded instance with sets/reps/weights, sortable by date or weight. |

### 4.6 Analytics & Graphs

All charts built with **Recharts**. Time ranges: 1W, 1M, 3M, 6M, 1Y, All.

#### 4.6.1 Strength Progression
- **Line chart** per exercise: estimated 1RM over time (Epley formula: `1RM = weight × (1 + reps/30)`)
- Toggle between exercises via dropdown
- Overlay multiple exercises for comparison

#### 4.6.2 Volume Over Time
- **Bar chart**: total weekly volume (lbs) stacked by muscle group
- **Line chart**: weekly volume per individual muscle group
- Shows trend line for progressive overload tracking

#### 4.6.3 Workout Frequency & Adherence
- **Heatmap** (GitHub-style contribution graph): days trained over the past year
- **Weekly frequency**: bar chart of sessions per week
- **Split distribution**: pie/donut chart showing Chest vs Back vs Legs vs Custom ratio
- **Streak tracking**: current streak, longest streak, total workouts

#### 4.6.4 Body Part Balance
- **Radar chart**: relative volume per muscle group over trailing 4 weeks
- Highlights imbalances (e.g., too much chest, not enough back)

#### 4.6.5 Personal Records
- Table of all-time PRs per exercise (heaviest weight, highest volume set, best estimated 1RM)
- PR timeline: when PRs were set, with celebration indicators

### 4.7 AI Coach (Gemini Integration)

Gemini is integrated as a contextual training coach, not a chatbot. It provides **structured, actionable commentary** based on actual lift data.

#### 4.7.1 Post-Workout Commentary
- Triggered automatically after completing a workout
- Gemini receives: current workout data + last 3 similar workouts
- Returns: performance assessment, highlights, suggestions
- Displayed on the workout summary screen and stored in `aiCommentary`

**Prompt structure:**
```
You are a strength training coach analyzing a workout.

Workout completed: {splitType} Day on {date}
Exercises performed:
{exerciseSummary}

Previous 3 {splitType} Day sessions:
{historicalData}

Provide a brief, encouraging analysis (3-5 sentences) covering:
1. Performance compared to recent sessions
2. Any notable PRs or improvements
3. One specific, actionable suggestion for next session
Keep the tone motivating but honest. Be specific — reference actual numbers.
```

#### 4.7.2 Recommended Workouts
- "Suggest Today's Workout" button on the dashboard
- Gemini receives: training history (last 2 weeks), split schedule, recent performance trends
- Returns: a complete workout plan (exercises, sets, reps, target weights)
- User can accept → auto-populates a new workout session
- User can modify before starting

**Prompt structure:**
```
You are a strength training coach designing today's workout.

User's training history (last 14 days):
{recentWorkouts}

User's typical split: Chest / Back / Legs
Days since last {eachSplit}: Chest={n}, Back={n}, Legs={n}

Based on recovery time and progressive overload principles, recommend:
1. Which split to train today and why
2. 5-6 exercises with target sets × reps × weight
3. Base weights on their recent performance, aiming for slight progression

Return as structured JSON:
{schema}
```

#### 4.7.3 Plateau Detection
- Runs weekly (or on-demand): analyzes last 4-6 weeks of data per exercise
- If estimated 1RM is stagnant or declining → Gemini generates specific programming adjustments
- Examples: deload recommendation, rep range changes, exercise substitutions

### 4.8 Settings & Preferences

| Setting | Options |
|---|---|
| Units | lb / kg (applies globally, converts stored data for display) |
| Default Rest Timer | 60s / 90s / 120s / 180s / custom |
| Training Split Config | Rename splits, change default exercises |
| Theme | Light / Dark / System |
| Data Export | JSON or CSV download of all workout history |
| Account | Change display name, link/unlink auth providers, delete account |

---

## 5. Firestore Data Architecture

```
users/
  {userId}/
    profile: { displayName, email, photoUrl, units, createdAt }
    settings: { defaultRestTimer, theme, splitConfig }

    workoutTemplates/
      {templateId}: { ...WorkoutTemplate }

    workoutSessions/
      {sessionId}: { ...WorkoutSession }

    personalRecords/
      {exerciseId}: { bestWeight, bestVolume, best1RM, dates }

exercises/                          ← shared collection (read-only for users)
  {exerciseId}: { ...Exercise }

userExercises/                      ← per-user custom exercises
  {userId}/
    {exerciseId}: { ...Exercise, isCustom: true }
```

**Firestore Indexes Required:**
- `workoutSessions`: `userId` + `splitType` + `completedAt` (desc)
- `workoutSessions`: `userId` + `completedAt` (desc)
- `exercises`: `primaryMuscles` (array-contains) + `name` (asc)

**Security Rules Principles:**
- Users can only read/write their own data under `users/{userId}/`
- `exercises/` collection is readable by all authenticated users, writable by none (admin-seeded)
- `userExercises/{userId}/` readable and writable only by the owner

---

## 6. Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Firebase Auth UI (Google + Email) |
| `/register` | Register | Email/password registration |
| `/` | Dashboard | Quick-start, weekly summary, streak, AI insight |
| `/workout/:sessionId` | Active Workout | In-session logging experience |
| `/workout/:sessionId/summary` | Workout Summary | Post-workout stats + AI commentary |
| `/history` | History | Calendar + list view of past workouts |
| `/history/:sessionId` | Workout Detail | Full detail of a completed workout |
| `/exercises` | Exercise Database | Searchable/filterable exercise browser |
| `/exercises/:exerciseId` | Exercise Detail | Info + personal history for one exercise |
| `/analytics` | Analytics | All charts and statistics |
| `/ai` | AI Coach | Gemini recommendations + plateau analysis |
| `/settings` | Settings | Preferences, profile, data export |

---

## 7. Component Architecture

```
src/
├── main.tsx
├── App.tsx                          # Router + AuthProvider + ThemeProvider
├── config/
│   └── firebase.ts                  # Firebase app init + Firestore + Auth
├── hooks/
│   ├── useAuth.ts                   # Auth state + login/logout/register
│   ├── useWorkout.ts                # Active workout CRUD + state
│   ├── useExercises.ts              # Exercise DB queries
│   ├── useHistory.ts                # Workout history queries
│   ├── useAnalytics.ts              # Computed stats + chart data
│   ├── useTimer.ts                  # Rest timer logic
│   └── useGemini.ts                 # Gemini API calls
├── stores/
│   └── workoutStore.ts              # Zustand: active workout session state
├── services/
│   ├── firestore.ts                 # Firestore read/write helpers
│   ├── gemini.ts                    # Gemini API service
│   └── calculations.ts             # Volume, 1RM, PR detection
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Nav + content area
│   │   ├── BottomNav.tsx            # Mobile bottom navigation
│   │   └── Header.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── QuickStartCard.tsx       # Split selection buttons
│   │   ├── WeeklySummary.tsx
│   │   ├── StreakWidget.tsx
│   │   └── AiInsight.tsx
│   ├── workout/
│   │   ├── ExerciseCard.tsx         # Single exercise with set logger
│   │   ├── SetRow.tsx               # Individual set input row
│   │   ├── RestTimer.tsx            # Countdown ring overlay
│   │   ├── ExerciseNav.tsx          # Swipe/tab navigation between exercises
│   │   ├── AddExerciseSheet.tsx     # Bottom sheet to search & add exercise
│   │   ├── VolumeTracker.tsx        # Sticky volume summary bar
│   │   ├── LastWorkoutRef.tsx       # Previous performance panel
│   │   └── WorkoutSummary.tsx       # Post-workout stats screen
│   ├── exercises/
│   │   ├── ExerciseSearch.tsx       # Search bar + filters
│   │   ├── ExerciseList.tsx         # Filtered results grid
│   │   ├── ExerciseDetail.tsx
│   │   └── CreateExercise.tsx
│   ├── history/
│   │   ├── CalendarView.tsx
│   │   ├── WorkoutList.tsx
│   │   └── WorkoutDetail.tsx
│   ├── analytics/
│   │   ├── StrengthChart.tsx        # Line chart: e1RM over time
│   │   ├── VolumeChart.tsx          # Bar chart: weekly volume
│   │   ├── FrequencyHeatmap.tsx     # GitHub-style heatmap
│   │   ├── SplitDistribution.tsx    # Donut chart
│   │   ├── BodyBalanceRadar.tsx     # Radar chart
│   │   └── PRTimeline.tsx
│   ├── ai/
│   │   ├── AiCommentary.tsx         # Displays Gemini analysis
│   │   ├── RecommendedWorkout.tsx   # Suggested workout card
│   │   └── PlateauAlert.tsx
│   └── ui/                          # shadcn/ui primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Sheet.tsx
│       ├── Dialog.tsx
│       └── ...
├── pages/
│   ├── DashboardPage.tsx
│   ├── ActiveWorkoutPage.tsx
│   ├── WorkoutSummaryPage.tsx
│   ├── HistoryPage.tsx
│   ├── ExercisesPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── AiCoachPage.tsx
│   ├── SettingsPage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── types/
│   └── index.ts                     # All TypeScript interfaces
├── lib/
│   └── utils.ts                     # Tailwind merge + helpers
└── assets/
    └── ...
```

---

## 8. UX Design Principles

### 8.1 In-Workout Philosophy
1. **Zero friction logging**: completing a set should take exactly 2 taps (adjust weight/reps if needed → tap checkbox)
2. **One exercise at a time**: card-based UI prevents cognitive overload
3. **Smart defaults**: pre-fill from last workout eliminates manual entry for 80% of sets
4. **Always-visible context**: last workout reference + running volume are never more than a glance away
5. **Interruption-proof**: workout state persists in Zustand + Firestore — closing the app mid-workout loses nothing

### 8.2 Mobile-First
- All touch targets minimum 44×44px
- Bottom sheet patterns instead of full-page navigations during workout
- Swipe gestures for exercise navigation
- Large number inputs optimized for one-handed use
- Bottom navigation bar (Dashboard, Workout, History, Analytics, Settings)

### 8.3 Visual Hierarchy
- **During workout**: exercise name and set inputs dominate; chrome fades
- **Dashboard**: action-oriented — the primary CTA is always "Start Workout"
- **Analytics**: clean charts with clear labels; no chart junk
- **Dark mode default** for gym environments (bright screens are annoying mid-set)

---

## 9. AI Integration Detail

### 9.1 Gemini API Configuration
- Model: `gemini-2.0-flash` (fast, cost-effective for structured analysis)
- Called client-side via API key (stored in environment variable)
- Rate limiting: max 10 Gemini calls per user per day (client-enforced)
- Fallback: if Gemini is unavailable, AI sections gracefully hide with no impact to core functionality

### 9.2 Data Sent to Gemini
Only workout performance data is sent — never personal identity info:
- Exercise names, sets, reps, weights, dates
- Split types and training frequency
- No email, name, or authentication tokens

### 9.3 AI Response Handling
- All Gemini responses are parsed and validated before display
- Recommended workouts return structured JSON that maps to `WorkoutTemplate`
- Commentary is plain text stored in `aiCommentary` field
- Loading states: skeleton cards while awaiting response
- Error states: "AI Coach is taking a break" — never blocks the user

---

## 10. Performance Requirements

| Metric | Target |
|---|---|
| Initial load (LCP) | < 2.0s |
| Set logging interaction | < 100ms perceived |
| Exercise search results | < 200ms after keystroke |
| Workout save to Firestore | < 500ms |
| Chart render | < 1s for 6 months of data |
| Gemini response | < 5s (non-blocking) |
| Offline set logging | Supported via Firestore offline persistence |

---

## 11. Security

- Firebase Security Rules enforce per-user data isolation
- Gemini API key stored in `.env` (never committed)
- No PII sent to Gemini API
- Firebase App Check enabled to prevent API abuse
- Input validation on all numeric fields (weight: 0-2000, reps: 0-500, sets: 0-50)

---

## 12. Future Considerations (Out of Scope for V1)

- Social features (share workouts, leaderboards)
- Superset / circuit tracking
- Cardio and conditioning tracking
- Body measurements and weight tracking
- Barbell plate calculator
- Apple Watch / Wear OS companion
- Progressive Web App (PWA) with push notifications
- Exercise video demos
- Workout program builder (multi-week periodization)

---

## 13. Success Metrics

| Metric | Target (90 days post-launch) |
|---|---|
| Workout completion rate | > 85% of started workouts are finished |
| Sets logged per session | Average 15+ |
| Return rate | > 60% of users return within 7 days |
| AI engagement | > 40% of users view AI commentary |
| Exercise search usage | > 50% of workouts use search to add exercises |

---

## 14. Development Phases

### Phase 1: Foundation (Core Logging)
- Firebase project setup (Auth + Firestore + Hosting)
- Authentication (Google + Email/Password)
- Exercise database seeding (100+ exercises)
- Workout templates (Chest/Back/Legs defaults)
- Active workout UI with set logging
- Last workout reference
- Basic workout history list

### Phase 2: Intelligence (Analytics + AI)
- Volume calculations and tracking
- Strength progression charts
- Frequency heatmap and adherence stats
- PR detection and tracking
- Gemini post-workout commentary
- Gemini recommended workouts

### Phase 3: Polish (UX + Advanced)
- Rest timer with haptic/sound alerts
- Exercise search with fuzzy matching
- Body balance radar chart
- Plateau detection
- Dark/light theme toggle
- Data export
- Performance optimization and offline support
