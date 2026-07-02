import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Registration from './pages/Registration'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
