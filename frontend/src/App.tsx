import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import ApexAutoLanding from './pages/ApexAutoLanding'
import Registration from './pages/Registration'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'

const Landing = () => {
  const navigate = useNavigate()
  const handleNavigate = (view: string) => {
    if (view === 'login') navigate('/login')
    else if (view === 'register') navigate('/register')
    else if (view === 'home') navigate('/')
  }
  return <ApexAutoLanding onNavigate={handleNavigate} />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
