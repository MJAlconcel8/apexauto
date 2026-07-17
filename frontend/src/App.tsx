import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import type { ViewParams } from './components/types'
import { AuthProvider } from './auth/AuthProvider'
import ProtectedRoute from './auth/ProtectedRoute'
import GuestOnlyRoute from './auth/GuestOnlyRoute'
import ApexAutoLanding from './pages/ApexAutoLanding'
import Registration from './pages/Registration'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'
import Cart from './pages/Cart'
import Home from './pages/Home'
import ChatbotPage from './pages/ChatbotPage'
import LoanCalc from './pages/LoanCalc'
import Catalogue from './pages/Catalogue'
import GuestCatalogue from './pages/GuestCatalogue'
import VehicleInfoPage from './pages/VehicleInfoPage'
import Compare from './pages/Compare'
import Forbidden from './pages/Forbidden'
import NotFound from './pages/NotFound'
import AdminPage from './pages/admin/AdminPage'

const Landing = () => {
  const navigate = useNavigate()
  const handleNavigate = (view: string, params?: ViewParams) => {
    if (view === 'login' || view === '/login') navigate('/login')
    else if (view === 'register' || view === '/register') navigate('/register')
    else if (view === 'chatbot' || view === '/chatbot') {
      const prompt = typeof params?.prompt === 'string' ? params.prompt : ''
      navigate(prompt ? `/chatbot?prompt=${encodeURIComponent(prompt)}` : '/chatbot')
    } else if (view === 'catalogue' || view === '/catalogue') navigate('/guest-catalogue')
    else if (view === 'home' || view === '/') navigate('/')
  }
  return <ApexAutoLanding onNavigate={handleNavigate} />
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<GuestOnlyRoute><Landing /></GuestOnlyRoute>} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
          <Route path="/register" element={<GuestOnlyRoute><Registration /></GuestOnlyRoute>} />
          <Route path="/forgot-password" element={<GuestOnlyRoute><ForgotPassword /></GuestOnlyRoute>} />
          <Route path="/verify-email" element={<GuestOnlyRoute><VerifyEmail /></GuestOnlyRoute>} />
          <Route path="/reset-password" element={<GuestOnlyRoute><ResetPassword /></GuestOnlyRoute>} />
          <Route path="/guest-catalogue" element={<GuestOnlyRoute><GuestCatalogue /></GuestOnlyRoute>} />
          <Route path="/vehicle/:id" element={<VehicleInfoPage />} />
          <Route path="/forbidden" element={<Forbidden />} />

          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/catalogue" element={<ProtectedRoute><Catalogue /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><LoanCalc /></ProtectedRoute>} />
          <Route path="/loan-calc" element={<ProtectedRoute><LoanCalc /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />

          <Route
            path="/admin/dashboard"
            element={(
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPage title="Admin Dashboard" description="A secure starting point for future operational controls and reporting." />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/users"
            element={(
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPage title="User Management" description="Future tools for reviewing accounts, roles, and account status will live here." />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/listings"
            element={(
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPage title="Listing Management" description="Future vehicle creation, editing, stock, and listing controls will live here." />
              </ProtectedRoute>
            )}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
