import type { ReactNode } from 'react'
import BottomNav from './BottomNav'
import Header from './Header'
import { useWorkoutStore } from '@/stores/workoutStore'

export default function AppShell({ children }: { children: ReactNode }) {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      {!activeWorkout && <BottomNav />}
    </div>
  )
}
