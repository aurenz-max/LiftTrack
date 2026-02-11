import { useLocation, useNavigate } from 'react-router-dom'
import { Trophy, Clock, Dumbbell, Flame, ArrowRight } from 'lucide-react'
import { formatDuration, formatVolume } from '@/lib/utils'

export default function WorkoutSummaryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const workout = location.state?.workout

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-muted-foreground">No workout data available.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const completedSets = workout.exercises.reduce(
    (sum: number, ex: any) => sum + ex.sets.filter((s: any) => s.completed).length,
    0
  )
  const prs = workout.exercises.reduce(
    (sum: number, ex: any) => sum + ex.sets.filter((s: any) => s.isPR).length,
    0
  )

  return (
    <div className="px-4 py-8 max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold">Workout Complete!</h1>
        <p className="text-muted-foreground">{workout.name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={Clock}
          label="Duration"
          value={formatDuration(workout.duration || 0)}
        />
        <SummaryCard
          icon={Dumbbell}
          label="Volume"
          value={`${formatVolume(workout.totalVolume || 0)} lb`}
        />
        <SummaryCard
          icon={Flame}
          label="Sets"
          value={completedSets.toString()}
        />
        <SummaryCard
          icon={Trophy}
          label="PRs"
          value={prs.toString()}
        />
      </div>

      {/* Exercise breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Exercises</h3>
        <div className="space-y-2">
          {workout.exercises.map((ex: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{ex.exerciseName}</p>
                <p className="text-xs text-muted-foreground">
                  {ex.sets.filter((s: any) => s.completed).length} sets &middot; {formatVolume(ex.volumeTotal)} lb
                </p>
              </div>
              {ex.sets.some((s: any) => s.isPR) && (
                <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded-full">PR</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/')}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          Back to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/history')}
          className="w-full h-12 bg-secondary hover:bg-muted text-foreground font-medium rounded-xl transition-colors"
        >
          View History
        </button>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
