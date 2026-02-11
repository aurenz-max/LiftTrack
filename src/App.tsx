import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ActiveWorkoutPage from '@/pages/ActiveWorkoutPage'
import WorkoutSummaryPage from '@/pages/WorkoutSummaryPage'
import HistoryPage from '@/pages/HistoryPage'
import WorkoutDetailPage from '@/pages/WorkoutDetailPage'
import ExercisesPage from '@/pages/ExercisesPage'
import SettingsPage from '@/pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/workout/:sessionId" element={<ActiveWorkoutPage />} />
                      <Route path="/workout/:sessionId/summary" element={<WorkoutSummaryPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/history/:sessionId" element={<WorkoutDetailPage />} />
                      <Route path="/exercises" element={<ExercisesPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
