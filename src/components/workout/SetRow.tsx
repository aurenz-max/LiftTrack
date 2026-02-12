import { Check } from 'lucide-react'
import { useWorkoutStore } from '@/stores/workoutStore'
import { cn } from '@/lib/utils'
import type { WorkoutSet } from '@/types'

interface Props {
  set: WorkoutSet
  setIndex: number
  exerciseIndex: number
  units: string
  onStartRest: (duration: number) => void
}

export default function SetRow({ set, setIndex, exerciseIndex, onStartRest }: Props) {
  const updateSet = useWorkoutStore((s) => s.updateSet)
  const completeSet = useWorkoutStore((s) => s.completeSet)

  const handleComplete = () => {
    if (set.completed) return
    completeSet(exerciseIndex, setIndex)
    onStartRest(90)
  }

  return (
    <div
      className={cn(
        'grid grid-cols-[40px_1fr_1fr_48px] gap-2 items-center px-2 py-2 rounded-xl transition-colors',
        set.completed ? 'bg-success/10' : 'bg-card border border-border'
      )}
    >
      {/* Set number */}
      <span className={cn(
        'text-sm font-bold text-center',
        set.completed ? 'text-success' : 'text-muted-foreground'
      )}>
        {set.setNumber}
      </span>

      {/* Weight input */}
      <div className="flex items-center justify-center">
        <input
          type="number"
          value={set.weight || ''}
          onChange={(e) => {
            if (set.completed) return
            updateSet(exerciseIndex, setIndex, { weight: Number(e.target.value) || 0 })
          }}
          disabled={set.completed}
          className={cn(
            'w-full h-9 text-center bg-transparent text-sm font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-70',
            set.completed && 'text-success'
          )}
          placeholder="0"
        />
      </div>

      {/* Reps input */}
      <div className="flex items-center justify-center">
        <input
          type="number"
          value={set.reps || ''}
          onChange={(e) => {
            if (set.completed) return
            updateSet(exerciseIndex, setIndex, { reps: Number(e.target.value) || 0 })
          }}
          disabled={set.completed}
          className={cn(
            'w-full h-9 text-center bg-transparent text-sm font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-70',
            set.completed && 'text-success'
          )}
          placeholder="0"
        />
      </div>

      {/* Complete / Remove button */}
      <div className="flex justify-center">
        {set.completed ? (
          <div className="w-9 h-9 rounded-lg bg-success/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-success" />
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="w-9 h-9 rounded-lg bg-secondary hover:bg-success/20 hover:text-success flex items-center justify-center text-muted-foreground transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
