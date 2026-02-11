import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuth } from '@/contexts/AuthContext'
import { useRestTimer } from '@/hooks/useTimer'
import { saveWorkoutSession } from '@/services/firestore'
import { calculateWorkoutVolume } from '@/services/calculations'
import { cn, formatVolume, formatDuration } from '@/lib/utils'
import ExerciseCard from '@/components/workout/ExerciseCard'
import RestTimerOverlay from '@/components/workout/RestTimerOverlay'
import AddExerciseSheet from '@/components/workout/AddExerciseSheet'

export default function ActiveWorkoutPage() {
  useParams()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()

  const activeWorkout = useWorkoutStore((s) => s.activeWorkout)
  const currentIndex = useWorkoutStore((s) => s.activeWorkout?.currentExerciseIndex ?? 0)
  const setCurrentIndex = useWorkoutStore((s) => s.setCurrentExerciseIndex)
  const endWorkout = useWorkoutStore((s) => s.endWorkout)
  const discardWorkout = useWorkoutStore((s) => s.discardWorkout)

  const restTimer = useRestTimer()
  const [elapsed, setElapsed] = useState(0)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!activeWorkout) {
      navigate('/')
      return
    }
    const start = new Date(activeWorkout.startedAt).getTime()
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [activeWorkout, navigate])

  if (!activeWorkout) return null

  const exercises = activeWorkout.exercises
  const currentExercise = exercises[currentIndex]
  const totalVolume = calculateWorkoutVolume(exercises)
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0)
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const units = userProfile?.units || 'lb'

  const handleFinish = async () => {
    if (!user) return
    setSaving(true)
    try {
      const workout = endWorkout()
      if (!workout) return
      await saveWorkoutSession(user.uid, {
        templateId: undefined,
        splitType: workout.splitType,
        name: workout.name,
        startedAt: new Date(workout.startedAt),
        duration: Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 1000),
        totalVolume: calculateWorkoutVolume(workout.exercises),
        exercises: workout.exercises,
      })
      navigate(`/workout/${workout.id}/summary`, {
        state: {
          workout: {
            ...workout,
            duration: Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 1000),
            totalVolume: calculateWorkoutVolume(workout.exercises),
          },
        },
      })
    } catch (err) {
      console.error('Failed to save workout:', err)
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    discardWorkout()
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{activeWorkout.name}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(elapsed)}
              </span>
              <span>{completedSets}/{totalSets} sets</span>
              <span>{formatVolume(totalVolume)} {units}</span>
            </div>
          </div>
          <button
            onClick={() => setShowFinishConfirm(true)}
            className="px-4 py-2 bg-success text-background text-sm font-semibold rounded-lg hover:bg-success/90 transition-colors"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Exercise navigation tabs */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto border-b border-border">
        {exercises.map((ex, i) => {
          const done = ex.sets.every((s) => s.completed)
          const active = i === currentIndex
          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                active ? 'bg-primary text-primary-foreground' : done ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {ex.exerciseName.length > 15 ? ex.exerciseName.slice(0, 15) + '...' : ex.exerciseName}
            </button>
          )
        })}
        <button
          onClick={() => setShowAddExercise(true)}
          className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Current exercise card */}
      <div className="flex-1 px-4 py-4">
        {currentExercise && (
          <ExerciseCard
            exercise={currentExercise}
            exerciseIndex={currentIndex}
            totalExercises={exercises.length}
            units={units}
            onStartRest={(duration) => restTimer.start(duration)}
          />
        )}
      </div>

      {/* Bottom navigation arrows */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {exercises.length}
          </span>
          <button
            onClick={() => setCurrentIndex(Math.min(exercises.length - 1, currentIndex + 1))}
            disabled={currentIndex === exercises.length - 1}
            className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rest timer overlay */}
      {restTimer.isRunning && (
        <RestTimerOverlay
          seconds={restTimer.seconds}
          duration={restTimer.duration}
          onDismiss={restTimer.stop}
        />
      )}

      {/* Add exercise sheet */}
      {showAddExercise && (
        <AddExerciseSheet onClose={() => setShowAddExercise(false)} />
      )}

      {/* Finish confirmation modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold">Finish Workout?</h3>
            <p className="text-sm text-muted-foreground">
              {completedSets} of {totalSets} sets completed.
              {completedSets < totalSets && ' Some sets are still incomplete.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 h-11 bg-secondary text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Continue
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 h-11 bg-success text-background font-semibold rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Finish'}
              </button>
            </div>
            <button
              onClick={handleDiscard}
              className="w-full text-sm text-destructive hover:underline"
            >
              Discard Workout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
