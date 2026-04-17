import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { ClassesPage } from './pages/ClassesPage'
import { ClassroomsPage } from './pages/ClassroomsPage'
import { BetaCodesPage } from './pages/BetaCodesPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { SubscriptionManagementPage } from './pages/SubscriptionManagementPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { SettingsPage } from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/classes" element={<ClassesPage />} />
                <Route path="/classrooms" element={<ClassroomsPage />} />
                <Route path="/beta-codes" element={<BetaCodesPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/subscription-management" element={<SubscriptionManagementPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
