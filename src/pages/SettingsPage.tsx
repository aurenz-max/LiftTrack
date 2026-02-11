import { useState } from 'react'
import { LogOut, Scale, Timer } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile } from '@/services/firestore'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user, userProfile, logout } = useAuth()
  const [saving, setSaving] = useState(false)

  const handleUnitChange = async (units: 'lb' | 'kg') => {
    if (!user || saving) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { units })
    } catch (err) {
      console.error('Failed to update units:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleRestTimerChange = async (duration: number) => {
    if (!user || saving) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { defaultRestTimer: duration })
    } catch (err) {
      console.error('Failed to update rest timer:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile section */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile</h3>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium">{userProfile?.displayName || user?.displayName || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Units */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Scale className="w-4 h-4" /> Units
        </h3>
        <div className="flex gap-2">
          {(['lb', 'kg'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => handleUnitChange(unit)}
              className={cn(
                'flex-1 h-11 rounded-xl font-medium transition-colors',
                userProfile?.units === unit
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {unit === 'lb' ? 'Pounds (lb)' : 'Kilograms (kg)'}
            </button>
          ))}
        </div>
      </section>

      {/* Rest Timer */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Timer className="w-4 h-4" /> Default Rest Timer
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[60, 90, 120, 180].map((seconds) => (
            <button
              key={seconds}
              onClick={() => handleRestTimerChange(seconds)}
              className={cn(
                'h-11 rounded-xl text-sm font-medium transition-colors',
                userProfile?.defaultRestTimer === seconds
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
            </button>
          ))}
        </div>
      </section>

      {/* Logout */}
      <section className="pt-4">
        <button
          onClick={handleLogout}
          className="w-full h-12 bg-destructive/10 text-destructive font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </section>
    </div>
  )
}
