import type { WorkoutSet, WorkoutExercise, WorkoutSession } from '@/types'

export function calculateSetVolume(set: WorkoutSet): number {
  return set.weight * set.reps
}

export function calculateExerciseVolume(sets: WorkoutSet[]): number {
  return sets
    .filter((s) => s.completed && !s.isWarmup)
    .reduce((total, set) => total + set.weight * set.reps, 0)
}

export function calculateWorkoutVolume(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, ex) => total + ex.volumeTotal, 0)
}

export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export function detectPR(
  currentWeight: number,
  currentReps: number,
  exerciseHistory: { sets: WorkoutSet[] }[]
): boolean {
  const current1RM = calculate1RM(currentWeight, currentReps)
  for (const session of exerciseHistory) {
    for (const set of session.sets) {
      if (set.completed && calculate1RM(set.weight, set.reps) >= current1RM) {
        return false
      }
    }
  }
  return current1RM > 0
}

export function getWorkoutDuration(startedAt: Date, completedAt?: Date): number {
  const end = completedAt || new Date()
  return Math.floor((end.getTime() - startedAt.getTime()) / 1000)
}

export function getWeeklyVolume(sessions: WorkoutSession[]): number {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  return sessions
    .filter((s) => s.completedAt && s.completedAt.toDate() > oneWeekAgo)
    .reduce((total, s) => total + s.totalVolume, 0)
}

export function getWeeklySessionCount(sessions: WorkoutSession[]): number {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  return sessions.filter(
    (s) => s.completedAt && s.completedAt.toDate() > oneWeekAgo
  ).length
}
