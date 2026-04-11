import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'
import Home from './pages/Home'
import AdminDashboard from './pages/admin/Dashboard'
import AdminCalendar from './pages/admin/Calendar'
import AdminQuoter from './pages/admin/Quoter'
import AdminAccounting from './pages/admin/Accounting'
import AdminUsers from './pages/admin/Users'
import AdminSiteEditor from './pages/admin/SiteEditor'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{ style: { background: '#fff0f5', color: '#9a0055', border: '1px solid #ffb3cc' } }} />
      <Routes>
        {/* Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="quoter" element={<AdminQuoter />} />
          <Route path="accounting" element={<AdminAccounting />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="site" element={<AdminSiteEditor />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
