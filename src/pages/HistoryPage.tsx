import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getWorkoutSessions } from '@/services/firestore'
import { formatDuration, formatVolume, cn } from '@/lib/utils'
import type { WorkoutSession } from '@/types'

const SPLIT_DOT_COLORS: Record<string, string> = {
  chest: 'bg-[var(--color-chest)]',
  back: 'bg-[var(--color-back)]',
  legs: 'bg-[var(--color-legs)]',
  custom: 'bg-accent',
}

export default function HistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<(WorkoutSession & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getWorkoutSessions(user.uid, 100)
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto space-y-3">
        <h1 className="text-2xl font-bold">History</h1>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
            <div className="w-32 h-5 bg-muted rounded mb-2" />
            <div className="w-48 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">History</h1>

      {sessions.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No workouts yet.</p>
          <p className="text-sm text-muted-foreground">Complete your first workout to see it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            const date = session.completedAt?.toDate?.() || new Date()
            const completedSets = session.exercises?.reduce(
              (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
              0
            ) || 0

            return (
              <button
                key={session.id}
                onClick={() => navigate(`/history/${session.id}`)}
                className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-secondary transition-colors text-left"
              >
                <div className={cn('w-3 h-3 rounded-full shrink-0', SPLIT_DOT_COLORS[session.splitType] || 'bg-accent')} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{session.name || session.splitType}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' '}&middot;{' '}
                    {session.duration ? formatDuration(session.duration) : '--'}
                    {' '}&middot;{' '}
                    {completedSets} sets
                    {' '}&middot;{' '}
                    {formatVolume(session.totalVolume || 0)} lb
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
