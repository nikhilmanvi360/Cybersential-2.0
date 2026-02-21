import React, { useState, useEffect } from 'react'

export default function Header({ user, onLogout, connected }) {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <header className="fixed top-[3px] left-0 right-0 z-40 bg-sentinel-bg/95 backdrop-blur-sm border-b border-sentinel-border">
            <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center justify-between">
                {/* Left: Logo + Title */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                            <path d="M50 5 L90 25 L90 55 C90 75 70 90 50 95 C30 90 10 75 10 55 L10 25 Z"
                                stroke="#00d4ff" strokeWidth="3" fill="rgba(0,212,255,0.1)" />
                            <text x="50" y="60" textAnchor="middle" fill="#00ff88" fontSize="28" fontWeight="bold">CS</text>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-sentinel-green font-mono leading-tight">
                            CYBERSENTINEL AI
                        </h1>
                        <p className="text-[9px] text-sentinel-muted tracking-[0.2em] uppercase">
                            National Cyber Defense Monitoring System
                        </p>
                    </div>
                </div>

                {/* Center: Status */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`pulse-dot ${connected ? 'green' : 'red'}`} />
                        <span className="text-xs font-mono text-sentinel-muted">
                            {connected ? 'CONNECTED' : 'DISCONNECTED'}
                        </span>
                    </div>
                    <span className="badge badge-restricted">{user?.clearanceLevel || 'RESTRICTED'}</span>
                    <span className="text-xs font-mono text-sentinel-cyan">
                        {time.toLocaleTimeString('en-GB', { hour12: false })} UTC+5:30
                    </span>
                </div>

                {/* Right: User + Logout */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-mono text-white">{user?.username || 'OPERATOR'}</p>
                        <p className="text-[10px] font-mono text-sentinel-cyan">{user?.role || 'ANALYST'}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-3 py-1.5 border border-sentinel-red/30 text-sentinel-red text-xs font-mono rounded hover:bg-sentinel-red/10 transition-colors"
                    >
                        LOGOUT
                    </button>
                </div>
            </div>
        </header>
    )
}
