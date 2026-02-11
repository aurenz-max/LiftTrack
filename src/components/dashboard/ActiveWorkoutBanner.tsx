import { Play, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatDuration } from '@/lib/utils'

interface Props {
  workout: { name: string; startedAt: Date; exercises: { exerciseName: string }[] }
  onResume: () => void
}

export default function ActiveWorkoutBanner({ workout, onResume }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(workout.startedAt).getTime()
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [workout.startedAt])

  return (
    <button
      onClick={onResume}
      className="w-full bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-4 hover:bg-primary/15 transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <Play className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold">{workout.name}</p>
        <p className="text-sm text-muted-foreground">
          {workout.exercises.length} exercises
        </p>
      </div>
      <div className="flex items-center gap-1 text-sm text-primary">
        <Clock className="w-4 h-4" />
        {formatDuration(elapsed)}
      </div>
    </button>
  )
}
