import { useEffect, useState } from 'react'
import { TrendingUp, Calendar, Weight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getWorkoutSessions } from '@/services/firestore'
import { getWeeklyVolume, getWeeklySessionCount } from '@/services/calculations'
import { formatVolume } from '@/lib/utils'
import type { WorkoutSession } from '@/types'

export default function WeeklySummary() {
  const { user, userProfile } = useAuth()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getWorkoutSessions(user.uid, 50)
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const weeklyVolume = getWeeklyVolume(sessions)
  const weeklyCount = getWeeklySessionCount(sessions)
  const totalWorkouts = sessions.length
  const units = userProfile?.units || 'lb'

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">This Week</h3>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-lg mb-2" />
              <div className="w-12 h-5 bg-muted rounded mb-1" />
              <div className="w-16 h-3 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">This Week</h3>
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Calendar} label="Workouts" value={weeklyCount.toString()} />
        <StatCard icon={Weight} label="Volume" value={`${formatVolume(weeklyVolume)}${units}`} />
        <StatCard icon={TrendingUp} label="Total" value={totalWorkouts.toString()} />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
