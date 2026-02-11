import { useEffect, useCallback, useRef } from 'react'
import { useWorkoutStore } from '@/stores/workoutStore'

export function useRestTimer() {
  const restTimer = useWorkoutStore((s) => s.restTimer)
  const startRestTimer = useWorkoutStore((s) => s.startRestTimer)
  const stopRestTimer = useWorkoutStore((s) => s.stopRestTimer)
  const tickRestTimer = useWorkoutStore((s) => s.tickRestTimer)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (restTimer?.running) {
      intervalRef.current = setInterval(() => {
        tickRestTimer()
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [restTimer?.running, tickRestTimer])

  useEffect(() => {
    if (restTimer && !restTimer.running && restTimer.seconds === 0) {
      try {
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
      } catch {}
    }
  }, [restTimer?.running, restTimer?.seconds])

  const start = useCallback((duration: number) => startRestTimer(duration), [startRestTimer])
  const stop = useCallback(() => stopRestTimer(), [stopRestTimer])

  return {
    isRunning: restTimer?.running ?? false,
    seconds: restTimer?.seconds ?? 0,
    duration: restTimer?.duration ?? 0,
    isComplete: restTimer ? !restTimer.running && restTimer.seconds === 0 : false,
    start,
    stop,
  }
}
