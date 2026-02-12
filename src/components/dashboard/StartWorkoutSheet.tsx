import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles, RotateCcw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkoutStore } from '@/stores/workoutStore'
import { getWorkoutSessionsByType } from '@/services/firestore'
import { DEFAULT_TEMPLATES } from '@/data/defaultTemplates'
import { formatVolume } from '@/lib/utils'
import type { SplitType, WorkoutSession } from '@/types'

interface Props {
  splitType: SplitType
  onClose: () => void
}

function formatDate(timestamp: { toDate(): Date }): string {
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function StartWorkoutSheet({ splitType, onClose }: Props) {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const startWorkout = useWorkoutStore((s) => s.startWorkout)
  const [priorWorkouts, setPriorWorkouts] = useState<(WorkoutSession & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  const template = DEFAULT_TEMPLATES.find((t) => t.splitType === splitType)
  const units = userProfile?.units || 'lb'

  useEffect(() => {
    if (!user) return
    getWorkoutSessionsByType(user.uid, splitType, 10)
      .then(setPriorWorkouts)
      .catch((err) => console.error('Failed to load prior workouts:', err))
      .finally(() => setLoading(false))
  }, [user, splitType])

  const handleStartFresh = () => {
    if (!template) return
    startWorkout(
      splitType,
      template.name,
      template.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        defaultSets: ex.defaultSets,
        defaultReps: ex.defaultReps,
      }))
    )
    const workoutId = useWorkoutStore.getState().activeWorkout?.id
    if (workoutId) navigate(`/workout/${workoutId}`)
  }

  const handleUsePrior = (workout: WorkoutSession) => {
    startWorkout(
      splitType,
      template?.name || workout.name,
      workout.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        defaultSets: ex.sets.length,
        defaultReps: ex.sets[0]?.reps || 10,
        lastSets: ex.sets,
      }))
    )
    const workoutId = useWorkoutStore.getState().activeWorkout?.id
    if (workoutId) navigate(`/workout/${workoutId}`)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
      <div className="bg-background border-t border-border rounded-t-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-lg font-bold">{template?.name || 'Start Workout'}</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
          {/* Start Fresh */}
          <button
            onClick={handleStartFresh}
            className="w-full flex items-center gap-4 px-4 py-4 bg-card border border-border rounded-xl hover:bg-secondary transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Start Fresh</p>
              <p className="text-xs text-muted-foreground">
                Default template &middot; {template?.exercises.length} exercises
              </p>
            </div>
          </button>

          {/* Prior workouts */}
          {loading && (
            <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>
          )}

          {!loading && priorWorkouts.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Prior Workouts
              </p>
              {priorWorkouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => handleUsePrior(workout)}
                  className="w-full flex items-center gap-4 px-4 py-4 bg-card border border-border rounded-xl hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      {workout.completedAt ? formatDate(workout.completedAt) : 'Unknown date'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {workout.exercises.map((e) => e.exerciseName).join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {workout.exercises.length} exercises &middot; {formatVolume(workout.totalVolume)} {units}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
