import { X, Search, Plus } from 'lucide-react'
import { useExercises } from '@/hooks/useExercises'
import { useWorkoutStore } from '@/stores/workoutStore'
import { cn } from '@/lib/utils'
import type { MuscleGroup } from '@/types'
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/types'

interface Props {
  onClose: () => void
}

export default function AddExerciseSheet({ onClose }: Props) {
  const { exercises, searchQuery, setSearchQuery, muscleFilter, setMuscleFilter } = useExercises()
  const addExercise = useWorkoutStore((s) => s.addExercise)

  const handleAdd = (exerciseId: string, exerciseName: string) => {
    addExercise(exerciseId, exerciseName)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
      <div className="bg-background border-t border-border rounded-t-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-lg font-bold">Add Exercise</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full h-10 pl-10 pr-3 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Muscle filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              label="All"
              active={!muscleFilter}
              onClick={() => setMuscleFilter('')}
            />
            {(['chest', 'upper_back', 'lats', 'quads', 'hamstrings', 'front_delts', 'biceps', 'triceps'] as MuscleGroup[]).map((mg) => (
              <FilterChip
                key={mg}
                label={MUSCLE_GROUP_LABELS[mg]}
                active={muscleFilter === mg}
                onClick={() => setMuscleFilter(muscleFilter === mg ? '' : mg)}
              />
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            {exercises.slice(0, 30).map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleAdd(ex.id, ex.name)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ex.primaryMuscles.map((m) => MUSCLE_GROUP_LABELS[m]).join(', ')} &middot; {EQUIPMENT_LABELS[ex.equipment]}
                  </p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
            {exercises.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No exercises found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}
