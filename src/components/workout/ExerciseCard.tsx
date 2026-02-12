import { useState } from 'react'
import { Plus, Trash2, History } from 'lucide-react'
import { useWorkoutStore } from '@/stores/workoutStore'
import { formatVolume } from '@/lib/utils'
import SetRow from './SetRow'
import ExerciseHistorySheet from './ExerciseHistorySheet'
import type { WorkoutExercise } from '@/types'

interface Props {
  exercise: WorkoutExercise
  exerciseIndex: number
  totalExercises: number
  units: string
  onStartRest: (duration: number) => void
}

export default function ExerciseCard({ exercise, exerciseIndex, totalExercises, units, onStartRest }: Props) {
  const addSet = useWorkoutStore((s) => s.addSet)
  const removeExercise = useWorkoutStore((s) => s.removeExercise)
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="space-y-4">
      {/* Exercise header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{exercise.exerciseName}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Exercise {exerciseIndex + 1} of {totalExercises}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
          {totalExercises > 1 && (
            <button
              onClick={() => removeExercise(exerciseIndex)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Set table header */}
      <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-2 px-2 text-xs text-muted-foreground font-medium uppercase">
        <span>Set</span>
        <span>{units}</span>
        <span>Reps</span>
        <span></span>
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={setIndex}
            set={set}
            setIndex={setIndex}
            exerciseIndex={exerciseIndex}
            units={units}
            onStartRest={onStartRest}
          />
        ))}
      </div>

      {/* Add set button */}
      <button
        onClick={() => addSet(exerciseIndex)}
        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Set
      </button>

      {/* Volume summary */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
        <span className="text-sm text-muted-foreground">Volume</span>
        <span className="text-sm font-bold">
          {formatVolume(exercise.volumeTotal)} {units}
        </span>
      </div>

      {showHistory && (
        <ExerciseHistorySheet
          exerciseId={exercise.exerciseId}
          exerciseName={exercise.exerciseName}
          units={units}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
