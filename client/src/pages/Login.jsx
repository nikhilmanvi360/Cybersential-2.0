import React, { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false)
    const [form, setForm] = useState({ username: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
            const payload = isRegister ? form : { email: form.email, password: form.password }
            const res = await axios.post(`${API_URL}${endpoint}`, payload)
            onLogin(res.data.token, res.data.user)
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-sentinel-bg grid-bg flex items-center justify-center p-4">
            {/* Tricolor top bar */}
            <div className="fixed top-0 left-0 right-0 tricolor-bar z-50" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    {/* Shield Logo */}
                    <div className="mx-auto mb-4 w-20 h-20">
                        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                            <path d="M50 5 L90 25 L90 55 C90 75 70 90 50 95 C30 90 10 75 10 55 L10 25 Z"
                                stroke="#00d4ff" strokeWidth="2" fill="rgba(0,212,255,0.1)" />
                            <path d="M50 15 L80 30 L80 55 C80 70 65 82 50 87 C35 82 20 70 20 55 L20 30 Z"
                                stroke="#00ff88" strokeWidth="1.5" fill="rgba(0,255,136,0.05)" />
                            <text x="50" y="60" textAnchor="middle" fill="#00ff88" fontSize="24" fontWeight="bold">CS</text>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-sentinel-green font-mono">CYBERSENTINEL AI</h1>
                    <p className="text-sentinel-muted text-xs mt-1 tracking-widest uppercase">
                        National Digital Defense Grid
                    </p>
                    <p className="text-sentinel-cyan text-[10px] mt-2 tracking-wider opacity-60">
                        "Securing the Nation's Digital Frontier"
                    </p>
                </div>

                {/* Login Panel */}
                <div className="panel glow-cyan">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-sentinel-cyan font-mono">
                            {isRegister ? '// REGISTER' : '// AUTHENTICATE'}
                        </h2>
                        <span className="badge badge-restricted">RESTRICTED</span>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-500/10 border border-red-500/30 text-sentinel-red text-sm p-3 rounded mb-4"
                        >
                            ⚠ {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-xs text-sentinel-muted mb-1 font-mono uppercase tracking-wider">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    className="w-full bg-sentinel-bg border border-sentinel-border rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-sentinel-cyan transition-colors"
                                    placeholder="operator_callsign"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-sentinel-muted mb-1 font-mono uppercase tracking-wider">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-sentinel-bg border border-sentinel-border rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-sentinel-cyan transition-colors"
                                placeholder="analyst@cybersentinel.gov"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-sentinel-muted mb-1 font-mono uppercase tracking-wider">
                                Access Key
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full bg-sentinel-bg border border-sentinel-border rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-sentinel-cyan transition-colors"
                                placeholder="••••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-sentinel-cyan/20 to-sentinel-green/20 border border-sentinel-cyan/50 text-sentinel-cyan font-mono font-semibold py-3 rounded-lg hover:border-sentinel-green hover:text-sentinel-green transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? '⟳ AUTHENTICATING...' : isRegister ? '▶ CREATE ACCOUNT' : '▶ LOGIN'}
                        </button>
                    </form>

                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        className="w-full mt-4 text-sentinel-muted text-xs font-mono hover:text-sentinel-cyan transition-colors"
                    >
                        {isRegister ? '← Back to Login' : '→ Create New Account'}
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-sentinel-muted mt-6 font-mono">
                    AUTHORIZED PERSONNEL ONLY • ALL ACCESS IS MONITORED AND LOGGED
                </p>
            </motion.div>
        </div>
    )
}
