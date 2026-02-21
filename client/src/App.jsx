import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

    const handleLogin = (token, user) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
                />
                <Route
                    path="/*"
                    element={
                        token ? (
                            <Dashboard user={user} token={token} onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
            </Routes>
        </Router>
    )
}

export default App
