import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkoutExercise, WorkoutSet, SplitType } from '@/types'
import { calculateExerciseVolume } from '@/services/calculations'
import { generateId } from '@/lib/utils'

interface ActiveWorkout {
  id: string
  splitType: SplitType
  name: string
  exercises: WorkoutExercise[]
  startedAt: Date
  currentExerciseIndex: number
}

interface WorkoutState {
  activeWorkout: ActiveWorkout | null
  restTimer: { running: boolean; seconds: number; duration: number } | null

  startWorkout: (splitType: SplitType, name: string, exercises: { exerciseId: string; exerciseName: string; defaultSets: number; defaultReps: number; lastSets?: WorkoutSet[] }[]) => void
  endWorkout: () => ActiveWorkout | null
  discardWorkout: () => void

  setCurrentExerciseIndex: (index: number) => void
  addExercise: (exerciseId: string, exerciseName: string, defaultSets?: number, defaultReps?: number) => void
  removeExercise: (index: number) => void
  reorderExercise: (fromIndex: number, toIndex: number) => void

  updateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void
  completeSet: (exerciseIndex: number, setIndex: number) => void
  addSet: (exerciseIndex: number) => void
  removeSet: (exerciseIndex: number, setIndex: number) => void

  startRestTimer: (duration: number) => void
  stopRestTimer: () => void
  tickRestTimer: () => void
}

function createDefaultSets(count: number, defaultReps: number, lastSets?: WorkoutSet[]): WorkoutSet[] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    weight: lastSets?.[i]?.weight ?? 0,
    reps: lastSets?.[i]?.reps ?? defaultReps,
    isWarmup: false,
    isDropset: false,
    isPR: false,
    completed: false,
  }))
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      restTimer: null,

      startWorkout: (splitType, name, exercises) => {
        set({
          activeWorkout: {
            id: generateId(),
            splitType,
            name,
            startedAt: new Date(),
            currentExerciseIndex: 0,
            exercises: exercises.map((ex, i) => ({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              order: i,
              sets: createDefaultSets(ex.defaultSets, ex.defaultReps, ex.lastSets),
              volumeTotal: 0,
            })),
          },
        })
      },

      endWorkout: () => {
        const workout = get().activeWorkout
        if (!workout) return null
        const result = { ...workout }
        set({ activeWorkout: null, restTimer: null })
        return result
      },

      discardWorkout: () => set({ activeWorkout: null, restTimer: null }),

      setCurrentExerciseIndex: (index) => {
        const workout = get().activeWorkout
        if (!workout) return
        set({ activeWorkout: { ...workout, currentExerciseIndex: index } })
      },

      addExercise: (exerciseId, exerciseName, defaultSets = 3, defaultReps = 10) => {
        const workout = get().activeWorkout
        if (!workout) return
        const newExercise: WorkoutExercise = {
          exerciseId,
          exerciseName,
          order: workout.exercises.length,
          sets: createDefaultSets(defaultSets, defaultReps),
          volumeTotal: 0,
        }
        set({
          activeWorkout: {
            ...workout,
            exercises: [...workout.exercises, newExercise],
            currentExerciseIndex: workout.exercises.length,
          },
        })
      },

      removeExercise: (index) => {
        const workout = get().activeWorkout
        if (!workout) return
        const exercises = workout.exercises.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order: i }))
        set({
          activeWorkout: {
            ...workout,
            exercises,
            currentExerciseIndex: Math.min(workout.currentExerciseIndex, exercises.length - 1),
          },
        })
      },

      reorderExercise: (fromIndex, toIndex) => {
        const workout = get().activeWorkout
        if (!workout) return
        const exercises = [...workout.exercises]
        const [moved] = exercises.splice(fromIndex, 1)
        exercises.splice(toIndex, 0, moved)
        set({
          activeWorkout: {
            ...workout,
            exercises: exercises.map((ex, i) => ({ ...ex, order: i })),
          },
        })
      },

      updateSet: (exerciseIndex, setIndex, updates) => {
        const workout = get().activeWorkout
        if (!workout) return
        const exercises = [...workout.exercises]
        const exercise = { ...exercises[exerciseIndex] }
        const sets = [...exercise.sets]
        sets[setIndex] = { ...sets[setIndex], ...updates }
        exercise.sets = sets
        exercise.volumeTotal = calculateExerciseVolume(sets)
        exercises[exerciseIndex] = exercise
        set({ activeWorkout: { ...workout, exercises } })
      },

      completeSet: (exerciseIndex, setIndex) => {
        const workout = get().activeWorkout
        if (!workout) return
        const exercises = [...workout.exercises]
        const exercise = { ...exercises[exerciseIndex] }
        const sets = [...exercise.sets]
        sets[setIndex] = { ...sets[setIndex], completed: true }
        exercise.sets = sets
        exercise.volumeTotal = calculateExerciseVolume(sets)
        exercises[exerciseIndex] = exercise
        set({ activeWorkout: { ...workout, exercises } })
      },

      addSet: (exerciseIndex) => {
        const workout = get().activeWorkout
        if (!workout) return
        const exercises = [...workout.exercises]
        const exercise = { ...exercises[exerciseIndex] }
        const lastSet = exercise.sets[exercise.sets.length - 1]
        exercise.sets = [
          ...exercise.sets,
          {
            setNumber: exercise.sets.length + 1,
            weight: lastSet?.weight ?? 0,
            reps: lastSet?.reps ?? 10,
            isWarmup: false,
            isDropset: false,
            isPR: false,
            completed: false,
          },
        ]
        exercises[exerciseIndex] = exercise
        set({ activeWorkout: { ...workout, exercises } })
      },

      removeSet: (exerciseIndex, setIndex) => {
        const workout = get().activeWorkout
        if (!workout) return
        const exercises = [...workout.exercises]
        const exercise = { ...exercises[exerciseIndex] }
        exercise.sets = exercise.sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 }))
        exercise.volumeTotal = calculateExerciseVolume(exercise.sets)
        exercises[exerciseIndex] = exercise
        set({ activeWorkout: { ...workout, exercises } })
      },

      startRestTimer: (duration) => set({ restTimer: { running: true, seconds: duration, duration } }),
      stopRestTimer: () => set({ restTimer: null }),
      tickRestTimer: () => {
        const timer = get().restTimer
        if (!timer || !timer.running) return
        if (timer.seconds <= 1) {
          set({ restTimer: { ...timer, seconds: 0, running: false } })
          return
        }
        set({ restTimer: { ...timer, seconds: timer.seconds - 1 } })
      },
    }),
    {
      name: 'lifttrack-workout',
      partialize: (state) => ({ activeWorkout: state.activeWorkout }),
    }
  )
)
