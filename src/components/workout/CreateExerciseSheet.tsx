import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/types'
import type { MuscleGroup, Equipment, Exercise } from '@/types'

interface Props {
  onClose: () => void
  onCreated: (exercise: Exercise) => void
  createExercise: (name: string, primaryMuscle: MuscleGroup, equipment: Equipment) => Promise<Exercise | null>
}

const MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]
const EQUIPMENT_TYPES = Object.keys(EQUIPMENT_LABELS) as Equipment[]

export default function CreateExerciseSheet({ onClose, onCreated, createExercise }: Props) {
  const [name, setName] = useState('')
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup | ''>('')
  const [equipment, setEquipment] = useState<Equipment | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canSave = name.trim().length > 0 && primaryMuscle && equipment

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      const exercise = await createExercise(name.trim(), primaryMuscle, equipment)
      if (exercise) {
        onCreated(exercise)
        onClose()
      }
    } catch (err) {
      setError('Failed to create exercise. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end justify-center">
      <div className="bg-background border-t border-border rounded-t-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-lg font-bold">Create Exercise</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Exercise Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hip Adductor Machine"
              className="w-full h-11 px-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Primary Muscle Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Primary Muscle Group</label>
            <div className="flex gap-2 flex-wrap">
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg}
                  onClick={() => setPrimaryMuscle(primaryMuscle === mg ? '' : mg)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    primaryMuscle === mg
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {MUSCLE_GROUP_LABELS[mg]}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Equipment</label>
            <div className="flex gap-2 flex-wrap">
              {EQUIPMENT_TYPES.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setEquipment(equipment === eq ? '' : eq)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    equipment === eq
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {EQUIPMENT_LABELS[eq]}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Save button */}
        <div className="px-4 py-3 border-t border-border">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={cn(
              'w-full h-11 rounded-lg font-semibold text-sm transition-colors',
              canSave && !saving
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
            )}
          >
            {saving ? 'Creating...' : 'Create Exercise'}
          </button>
        </div>
      </div>
    </div>
  )
}
