import { X } from 'lucide-react'
import { formatTimerDisplay } from '@/lib/utils'

interface Props {
  seconds: number
  duration: number
  onDismiss: () => void
}

export default function RestTimerOverlay({ seconds, duration, onDismiss }: Props) {
  const progress = duration > 0 ? ((duration - seconds) / duration) * 100 : 0
  const circumference = 2 * Math.PI * 54

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
            <circle
              cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6"
              className="text-primary transition-all duration-1000"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {formatTimerDisplay(seconds)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">Rest Timer</p>
          <p className="text-xs text-muted-foreground">{formatTimerDisplay(seconds)} remaining</p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
