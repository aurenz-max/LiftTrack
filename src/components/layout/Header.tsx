import { Dumbbell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkoutStore } from '@/stores/workoutStore'

export default function Header() {
  const { user } = useAuth()
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout)

  if (activeWorkout) return null

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold">LiftTrack</span>
        </div>
        {user && (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </header>
  )
}
