import type { Timestamp } from 'firebase/firestore'

export type MuscleGroup =
  | 'chest' | 'upper_back' | 'lats' | 'traps'
  | 'front_delts' | 'side_delts' | 'rear_delts'
  | 'biceps' | 'triceps' | 'forearms'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'abs' | 'obliques' | 'lower_back'

export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'bodyweight' | 'kettlebell' | 'bands' | 'other'

export type ExerciseCategory = 'compound' | 'isolation' | 'cardio' | 'stretch'

export type SplitType = 'chest' | 'back' | 'legs' | 'custom'

export interface Exercise {
  id: string
  name: string
  aliases: string[]
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment
  category: ExerciseCategory
  instructions?: string
  isCustom: boolean
  createdBy?: string
}

export interface WorkoutTemplate {
  id: string
  userId: string
  name: string
  splitType: SplitType
  exercises: TemplateExercise[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface TemplateExercise {
  exerciseId: string
  exerciseName: string
  order: number
  defaultSets: number
  defaultReps: number
  notes?: string
}

export interface WorkoutSession {
  id: string
  userId: string
  templateId?: string
  splitType: SplitType
  name: string
  startedAt: Timestamp
  completedAt?: Timestamp
  duration?: number
  totalVolume: number
  exercises: WorkoutExercise[]
  notes?: string
  aiCommentary?: string
}

export interface WorkoutExercise {
  exerciseId: string
  exerciseName: string
  order: number
  sets: WorkoutSet[]
  volumeTotal: number
}

export interface WorkoutSet {
  setNumber: number
  weight: number
  reps: number
  rpe?: number
  isWarmup: boolean
  isDropset: boolean
  isPR: boolean
  completed: boolean
  completedAt?: Timestamp
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  bestWeight: number
  bestWeightReps: number
  bestVolume: number
  best1RM: number
  bestWeightDate: Timestamp
  bestVolumeDate: Timestamp
  best1RMDate: Timestamp
}

export interface UserProfile {
  displayName: string
  email: string
  photoUrl?: string
  units: 'lb' | 'kg'
  defaultRestTimer: number
  createdAt: Timestamp
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  upper_back: 'Upper Back',
  lats: 'Lats',
  traps: 'Traps',
  front_delts: 'Front Delts',
  side_delts: 'Side Delts',
  rear_delts: 'Rear Delts',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  abs: 'Abs',
  obliques: 'Obliques',
  lower_back: 'Lower Back',
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
  bands: 'Bands',
  other: 'Other',
}

export const SPLIT_COLORS: Record<SplitType, string> = {
  chest: 'var(--color-chest)',
  back: 'var(--color-back)',
  legs: 'var(--color-legs)',
  custom: 'var(--color-accent)',
}
