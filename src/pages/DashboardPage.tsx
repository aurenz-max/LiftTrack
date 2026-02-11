import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkoutStore } from '@/stores/workoutStore'
import QuickStartCard from '@/components/dashboard/QuickStartCard'
import WeeklySummary from '@/components/dashboard/WeeklySummary'
import ActiveWorkoutBanner from '@/components/dashboard/ActiveWorkoutBanner'

export default function DashboardPage() {
  const { user, userProfile } = useAuth()
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout)
  const navigate = useNavigate()

  const displayName = userProfile?.displayName || user?.displayName || 'Lifter'
  const greeting = getGreeting()

  return (
    <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold">{greeting}, {displayName.split(' ')[0]}</h2>
        <p className="text-muted-foreground text-sm mt-1">Ready to train?</p>
      </div>

      {activeWorkout && (
        <ActiveWorkoutBanner
          workout={activeWorkout}
          onResume={() => navigate(`/workout/${activeWorkout.id}`)}
        />
      )}

      <QuickStartCard />
      <WeeklySummary />
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
