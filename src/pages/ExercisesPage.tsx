import { useState } from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import { useExercises } from '@/hooks/useExercises'
import { useCustomExercises } from '@/hooks/useCustomExercises'
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/types'
import type { MuscleGroup, Equipment } from '@/types'
import { cn } from '@/lib/utils'
import CreateExerciseSheet from '@/components/workout/CreateExerciseSheet'

export default function ExercisesPage() {
  const { customExercises, addCustomExercise, deleteCustomExercise } = useCustomExercises()
  const {
    exercises,
    searchQuery,
    setSearchQuery,
    muscleFilter,
    setMuscleFilter,
    equipmentFilter,
    setEquipmentFilter,
  } = useExercises(customExercises)

  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full h-11 pl-10 pr-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Muscle group filters */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Muscle Group</p>
        <div className="flex gap-2 flex-wrap">
          <FilterChip label="All" active={!muscleFilter} onClick={() => setMuscleFilter('')} />
          {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((mg) => (
            <FilterChip
              key={mg}
              label={MUSCLE_GROUP_LABELS[mg]}
              active={muscleFilter === mg}
              onClick={() => setMuscleFilter(muscleFilter === mg ? '' : mg)}
            />
          ))}
        </div>
      </div>

      {/* Equipment filters */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Equipment</p>
        <div className="flex gap-2 flex-wrap">
          <FilterChip label="All" active={!equipmentFilter} onClick={() => setEquipmentFilter('')} />
          {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((eq) => (
            <FilterChip
              key={eq}
              label={EQUIPMENT_LABELS[eq]}
              active={equipmentFilter === eq}
              onClick={() => setEquipmentFilter(equipmentFilter === eq ? '' : eq)}
            />
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{exercises.length} exercises found</p>

      {/* Exercise list */}
      <div className="space-y-1">
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{ex.name}</p>
                {ex.isCustom && (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ex.primaryMuscles.map((m) => MUSCLE_GROUP_LABELS[m]).join(', ')}
                {' '}&middot;{' '}
                {EQUIPMENT_LABELS[ex.equipment]}
                {' '}&middot;{' '}
                {ex.category}
              </p>
            </div>
            {ex.isCustom && (
              <button
                onClick={() => deleteCustomExercise(ex.id)}
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateExerciseSheet
          onClose={() => setShowCreate(false)}
          onCreated={() => {}}
          createExercise={addCustomExercise}
        />
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}
