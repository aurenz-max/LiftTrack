import type { SplitType, TemplateExercise } from '@/types'

export interface DefaultTemplate {
  name: string
  splitType: SplitType
  exercises: TemplateExercise[]
}

export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    name: 'Chest Day',
    splitType: 'chest',
    exercises: [
      { exerciseId: 'flat-barbell-bench-press', exerciseName: 'Flat Barbell Bench Press', order: 0, defaultSets: 4, defaultReps: 8 },
      { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', order: 1, defaultSets: 3, defaultReps: 10 },
      { exerciseId: 'cable-flyes', exerciseName: 'Cable Flyes', order: 2, defaultSets: 3, defaultReps: 12 },
      { exerciseId: 'dips', exerciseName: 'Dips', order: 3, defaultSets: 3, defaultReps: 10 },
      { exerciseId: 'pec-deck', exerciseName: 'Pec Deck', order: 4, defaultSets: 3, defaultReps: 12 },
    ],
  },
  {
    name: 'Back Day',
    splitType: 'back',
    exercises: [
      { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', order: 0, defaultSets: 4, defaultReps: 8 },
      { exerciseId: 'pull-ups', exerciseName: 'Pull-ups', order: 1, defaultSets: 3, defaultReps: 8 },
      { exerciseId: 'seated-cable-row', exerciseName: 'Seated Cable Row', order: 2, defaultSets: 3, defaultReps: 10 },
      { exerciseId: 'lat-pulldown', exerciseName: 'Lat Pulldown', order: 3, defaultSets: 3, defaultReps: 10 },
      { exerciseId: 'face-pulls', exerciseName: 'Face Pulls', order: 4, defaultSets: 3, defaultReps: 15 },
    ],
  },
  {
    name: 'Leg Day',
    splitType: 'legs',
    exercises: [
      { exerciseId: 'barbell-squat', exerciseName: 'Barbell Squat', order: 0, defaultSets: 4, defaultReps: 8 },
      { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', order: 1, defaultSets: 3, defaultReps: 10 },
      { exerciseId: 'leg-press', exerciseName: 'Leg Press', order: 2, defaultSets: 3, defaultReps: 12 },
      { exerciseId: 'leg-curl', exerciseName: 'Leg Curl', order: 3, defaultSets: 3, defaultReps: 12 },
      { exerciseId: 'calf-raises', exerciseName: 'Calf Raises', order: 4, defaultSets: 4, defaultReps: 15 },
    ],
  },
]
