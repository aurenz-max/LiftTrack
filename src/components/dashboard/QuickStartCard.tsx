import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Zap, Footprints, Plus } from 'lucide-react'
import { useWorkoutStore } from '@/stores/workoutStore'
import { DEFAULT_TEMPLATES } from '@/data/defaultTemplates'
import StartWorkoutSheet from './StartWorkoutSheet'
import type { SplitType } from '@/types'
import { cn } from '@/lib/utils'

const SPLIT_CONFIG: Record<string, { icon: typeof Flame; color: string; bg: string }> = {
  chest: { icon: Flame, color: 'text-[var(--color-chest)]', bg: 'bg-[var(--color-chest)]/10' },
  back: { icon: Zap, color: 'text-[var(--color-back)]', bg: 'bg-[var(--color-back)]/10' },
  legs: { icon: Footprints, color: 'text-[var(--color-legs)]', bg: 'bg-[var(--color-legs)]/10' },
}

export default function QuickStartCard() {
  const navigate = useNavigate()
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout)
  const [selectedSplit, setSelectedSplit] = useState<SplitType | null>(null)

  const handleStart = (splitType: SplitType) => {
    if (activeWorkout) {
      navigate(`/workout/${activeWorkout.id}`)
      return
    }
    setSelectedSplit(splitType)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Start</h3>
      <div className="grid grid-cols-3 gap-3">
        {DEFAULT_TEMPLATES.map((template) => {
          const config = SPLIT_CONFIG[template.splitType]
          const Icon = config?.icon || Plus
          return (
            <button
              key={template.splitType}
              onClick={() => handleStart(template.splitType)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors',
              )}
            >
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', config?.bg)}>
                <Icon className={cn('w-6 h-6', config?.color)} />
              </div>
              <span className="text-sm font-medium">{template.name.replace(' Day', '')}</span>
            </button>
          )
        })}
      </div>

      {selectedSplit && (
        <StartWorkoutSheet
          splitType={selectedSplit}
          onClose={() => setSelectedSplit(null)}
        />
      )}
    </div>
  )
}
