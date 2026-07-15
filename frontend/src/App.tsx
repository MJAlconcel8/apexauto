import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import type { ViewParams } from './components/types'
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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/guest-catalogue" element={<GuestCatalogue />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/finance" element={<LoanCalc />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
