import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getExerciseHistory } from '@/services/firestore'
import { formatVolume } from '@/lib/utils'
import type { WorkoutSet } from '@/types'
import type { Timestamp } from 'firebase/firestore'

interface HistoryEntry {
  date: Timestamp
  sets: WorkoutSet[]
  volumeTotal: number
}

interface Props {
  exerciseId: string
  exerciseName: string
  units: string
  onClose: () => void
}

function formatDate(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function ExerciseHistorySheet({ exerciseId, exerciseName, units, onClose }: Props) {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getExerciseHistory(user.uid, exerciseId, 10)
      .then(setHistory)
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false))
  }, [user, exerciseId])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
      <div className="bg-background border-t border-border rounded-t-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="text-lg font-bold">History</h3>
            <p className="text-xs text-muted-foreground">{exerciseName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && (
            <p className="text-center text-sm text-muted-foreground py-8">Loading...</p>
          )}

          {!loading && history.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No previous data for this exercise
            </p>
          )}

          {!loading && history.length > 0 && (
            <div className="space-y-4">
              {history.map((entry, i) => (
                <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{formatDate(entry.date)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatVolume(entry.volumeTotal)} {units}
                    </span>
                  </div>

                  {/* Sets table */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-medium uppercase">
                      <span>Set</span>
                      <span>{units}</span>
                      <span>Reps</span>
                    </div>
                    {entry.sets.filter((s) => s.completed).map((set, j) => (
                      <div key={j} className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">{set.setNumber}</span>
                        <span className="font-medium">{set.weight}</span>
                        <span className="font-medium">{set.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
