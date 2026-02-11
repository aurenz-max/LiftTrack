import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Dumbbell, Flame, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getWorkoutSessionById, deleteWorkoutSession } from '@/services/firestore'
import { formatDuration, formatVolume } from '@/lib/utils'
import type { WorkoutSession } from '@/types'

export default function WorkoutDetailPage() {
  const { sessionId } = useParams()
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const units = userProfile?.units || 'lb'

  useEffect(() => {
    if (!user || !sessionId) return
    getWorkoutSessionById(user.uid, sessionId)
      .then(setSession)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, sessionId])

  const handleDelete = async () => {
    if (!user || !sessionId) return
    await deleteWorkoutSession(user.uid, sessionId)
    navigate('/history')
  }

  if (loading) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="w-48 h-7 bg-muted rounded" />
          <div className="w-32 h-5 bg-muted rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto text-center">
        <p className="text-muted-foreground">Workout not found.</p>
        <button onClick={() => navigate('/history')} className="mt-4 text-primary hover:underline text-sm">
          Back to History
        </button>
      </div>
    )
  }

  const date = session.completedAt?.toDate?.() || new Date()
  const completedSets = session.exercises?.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  ) || 0

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/history')} className="p-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{session.name}</h1>
          <p className="text-sm text-muted-foreground">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold">{session.duration ? formatDuration(session.duration) : '--'}</p>
          <p className="text-[10px] text-muted-foreground">Duration</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold">{formatVolume(session.totalVolume || 0)} {units}</p>
          <p className="text-[10px] text-muted-foreground">Volume</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold">{completedSets}</p>
          <p className="text-[10px] text-muted-foreground">Sets</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Exercises</h3>
        {session.exercises?.map((ex, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{ex.exerciseName}</h4>
              <span className="text-xs text-muted-foreground">{formatVolume(ex.volumeTotal)} {units}</span>
            </div>
            <div className="space-y-1">
              {ex.sets.filter((s) => s.completed).map((set, j) => (
                <div key={j} className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground w-6">S{set.setNumber}</span>
                  <span className="font-medium">{set.weight} {units}</span>
                  <span className="text-muted-foreground">x</span>
                  <span className="font-medium">{set.reps} reps</span>
                  {set.isPR && <span className="text-xs text-warning font-bold">PR</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Commentary */}
      {session.aiCommentary && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-primary mb-2">AI Coach</h3>
          <p className="text-sm text-foreground/80">{session.aiCommentary}</p>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold">Delete Workout?</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-11 bg-secondary text-foreground font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-11 bg-destructive text-destructive-foreground font-semibold rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
